// WetLab Planner (integrated Cell Culture Recorder) — Tauri shell.
//
// The whole WetlabPlanner Express server runs as a bundled `api-server`
// sidecar (Node SEA binary in binaries/api-server-<triple>), in file-DB mode
// with no login. The webview loads the static frontend (../web) and talks to
// the sidecar exclusively through the `proxy_request` command below, which
// bypasses the WebView's networking restrictions by issuing the HTTP call from
// Rust (reqwest → 127.0.0.1:<port>).

use tauri::{Emitter, Manager};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_updater::UpdaterExt;
use tauri_plugin_sql::{Migration, MigrationKind};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

const DB_URL: &str = "sqlite:cell-culture-recorder.db";

// Cell Culture Recorder's SQLite migrations are kept registered for Phase 2
// (the unified CCR grid). Phase 1's WetLab frontend uses the sidecar/file-DB
// and does not touch these tables — they're harmless to create at startup.
fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_cell_culture_records",
            sql: include_str!("../migrations/001_initial_schema.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "add_donor_vessel_lineage_fields",
            sql: include_str!("../migrations/002_donor_vessel_lineage.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "add_source_conflict_tracking",
            sql: include_str!("../migrations/003_source_conflict_tracking.sql"),
            kind: MigrationKind::Up,
        },
    ]
}

#[derive(serde::Serialize, Clone)]
struct UpdateProgress {
    downloaded: u64,
    total: Option<u64>,
}

#[derive(serde::Serialize, Clone)]
struct UpdateInfo {
    available: bool,
    version: String,
    current_version: String,
}

struct SidecarPort(u16);
struct SidecarError(Arc<Mutex<Option<String>>>);
struct SidecarChild(Arc<Mutex<Option<CommandChild>>>);

#[tauri::command]
fn get_sidecar_port(state: tauri::State<'_, SidecarPort>) -> u16 {
    state.0
}

#[tauri::command]
fn get_sidecar_error(state: tauri::State<'_, SidecarError>) -> Option<String> {
    state.0.lock().unwrap().clone()
}

/// Proxy an HTTP request to the sidecar from Rust, returning the raw body text.
/// This is the single networking chokepoint the frontend's apiFetch() uses.
#[tauri::command]
async fn proxy_request(
    method: String,
    path: String,
    body: Option<String>,
    state: tauri::State<'_, SidecarPort>,
) -> Result<String, String> {
    let port = state.0;
    let url = format!("http://127.0.0.1:{}{}", port, path);
    let client = reqwest::Client::new();

    let req = match method.to_uppercase().as_str() {
        "GET" => client.get(&url),
        "POST" => {
            let mut r = client.post(&url);
            if let Some(b) = body { r = r.header("Content-Type", "application/json").body(b); }
            r
        }
        "PUT" => {
            let mut r = client.put(&url);
            if let Some(b) = body { r = r.header("Content-Type", "application/json").body(b); }
            r
        }
        "PATCH" => {
            let mut r = client.patch(&url);
            if let Some(b) = body { r = r.header("Content-Type", "application/json").body(b); }
            r
        }
        "DELETE" => {
            let mut r = client.delete(&url);
            if let Some(b) = body { r = r.header("Content-Type", "application/json").body(b); }
            r
        }
        _ => return Err(format!("Unsupported method: {}", method)),
    };

    let resp = req.send().await.map_err(|e| format!("Request failed: {}", e))?;
    let status = resp.status().as_u16();
    let text = resp.text().await.map_err(|e| format!("Failed to read response: {}", e))?;
    // Return a {status, body} envelope so the frontend can recover the real
    // HTTP status for every response (2xx and errors alike). Err is reserved
    // for transport failures (sidecar down / connection refused).
    Ok(serde_json::json!({ "status": status, "body": text }).to_string())
}

/// Multipart upload proxy (CSV import etc.) — base64 file payloads from JS.
#[tauri::command]
async fn proxy_upload(
    path: String,
    files: Vec<FileData>,
    field_name: String,
    state: tauri::State<'_, SidecarPort>,
) -> Result<String, String> {
    let port = state.0;
    let url = format!("http://127.0.0.1:{}{}", port, path);
    let client = reqwest::Client::new();
    let mut form = reqwest::multipart::Form::new();
    for file in files {
        let decoded = base64_decode(&file.data).map_err(|e| format!("Base64 decode error: {}", e))?;
        let part = reqwest::multipart::Part::bytes(decoded)
            .file_name(file.name)
            .mime_str("application/octet-stream")
            .map_err(|e| format!("MIME error: {}", e))?;
        form = form.part(field_name.clone(), part);
    }
    let resp = client.post(&url).multipart(form).send().await
        .map_err(|e| format!("Upload request failed: {}", e))?;
    let text = resp.text().await.map_err(|e| format!("Failed to read upload response: {}", e))?;
    Ok(text)
}

#[derive(serde::Deserialize)]
struct FileData {
    name: String,
    data: String, // base64
}

/// Kill the sidecar — called before an update restart.
#[tauri::command]
async fn kill_sidecar(state: tauri::State<'_, SidecarChild>) -> Result<(), String> {
    kill_sidecar_process(&state.0);
    Ok(())
}

fn kill_sidecar_process(child_mutex: &Arc<Mutex<Option<CommandChild>>>) {
    if let Ok(mut guard) = child_mutex.lock() {
        if let Some(child) = guard.take() {
            eprintln!("[cleanup] Killing sidecar process");
            let _ = child.kill();
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = std::process::Command::new("pkill").args(["-f", "api-server"]).output();
    }
    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("taskkill").args(["/F", "/IM", "api-server.exe", "/T"]).output();
    }
}

/// Check the configured release endpoint for a newer version (no download).
#[tauri::command]
async fn check_for_update(app: tauri::AppHandle) -> Result<UpdateInfo, String> {
    let current = app.package_info().version.to_string();
    let updater = app.updater().map_err(|e| format!("Updater unavailable: {}", e))?;
    match updater.check().await.map_err(|e| format!("Update check failed: {}", e))? {
        Some(update) => Ok(UpdateInfo {
            available: true,
            version: update.version.clone(),
            current_version: current,
        }),
        None => Ok(UpdateInfo {
            available: false,
            version: current.clone(),
            current_version: current,
        }),
    }
}

/// Download + install the available update from the configured endpoint.
/// Emits `updater://progress` and `updater://finished` so the UI can show a
/// progress bar. The caller restarts via `restart_app` afterwards.
#[tauri::command]
async fn download_and_install_update(app: tauri::AppHandle) -> Result<String, String> {
    let updater = app.updater().map_err(|e| format!("Updater unavailable: {}", e))?;
    let update = updater.check().await.map_err(|e| format!("Update check failed: {}", e))?
        .ok_or_else(|| "No update available".to_string())?;
    eprintln!("[updater] Installing version={}", update.version);
    let mut total_downloaded = 0u64;
    let app_for_progress = app.clone();
    let app_for_finished = app.clone();
    update.download_and_install(
        move |chunk, total| {
            total_downloaded += chunk as u64;
            let _ = app_for_progress.emit("updater://progress", UpdateProgress { downloaded: total_downloaded, total });
        },
        move || { let _ = app_for_finished.emit::<()>("updater://finished", ()); },
    ).await.map_err(|e| format!("Download/install failed: {}", e))?;
    Ok("Installed. Restart to apply.".to_string())
}

/// Kill the sidecar and relaunch the app (after an update install).
#[tauri::command]
fn restart_app(app: tauri::AppHandle) {
    if let Some(state) = app.try_state::<SidecarChild>() {
        kill_sidecar_process(&state.0);
    }
    app.restart();
}

fn base64_decode(input: &str) -> Result<Vec<u8>, String> {
    let lookup = |c: u8| -> Result<u8, String> {
        match c {
            b'A'..=b'Z' => Ok(c - b'A'),
            b'a'..=b'z' => Ok(c - b'a' + 26),
            b'0'..=b'9' => Ok(c - b'0' + 52),
            b'+' => Ok(62),
            b'/' => Ok(63),
            b'=' => Ok(0),
            _ => Err(format!("Invalid base64 char: {}", c as char)),
        }
    };
    let bytes: Vec<u8> = input.bytes().filter(|&b| b != b'\n' && b != b'\r').collect();
    let mut result = Vec::with_capacity(bytes.len() * 3 / 4);
    for chunk in bytes.chunks(4) {
        if chunk.len() < 4 { break; }
        let a = lookup(chunk[0])?;
        let b = lookup(chunk[1])?;
        let c = lookup(chunk[2])?;
        let d = lookup(chunk[3])?;
        result.push((a << 2) | (b >> 4));
        if chunk[2] != b'=' { result.push((b << 4) | (c >> 2)); }
        if chunk[3] != b'=' { result.push((c << 6) | d); }
    }
    Ok(result)
}

/// Pick a free TCP port on loopback for the sidecar. Tiny TOCTOU window
/// before the sidecar binds, acceptable for a single-user desktop app.
fn find_free_port() -> u16 {
    std::net::TcpListener::bind("127.0.0.1:0")
        .and_then(|l| l.local_addr())
        .map(|a| a.port())
        .unwrap_or(8787)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(DB_URL, migrations())
                .build(),
        )
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let sidecar_error: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));
            let sidecar_child: Arc<Mutex<Option<CommandChild>>> = Arc::new(Mutex::new(None));

            // Resolve the local file-DB path inside the app-data dir.
            let db_path = app
                .path()
                .app_data_dir()
                .map(|d| {
                    let _ = std::fs::create_dir_all(&d);
                    d.join("wetlab-db.json")
                })
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|_| "wetlab-db.json".to_string());
            eprintln!("[setup] DB file: {}", db_path);

            let port = find_free_port();
            eprintln!("[setup] Sidecar port: {}", port);

            // macOS Gatekeeper: clear quarantine on the sidecar + bundle so the
            // ad-hoc-signed Node binary can execute after a download/update.
            #[cfg(target_os = "macos")]
            if !cfg!(debug_assertions) {
                if let Ok(exe_path) = std::env::current_exe() {
                    if let Some(macos_dir) = exe_path.parent() {
                        let sidecar_name = format!("api-server-{}-apple-darwin", std::env::consts::ARCH);
                        let sidecar_path = macos_dir.join(&sidecar_name);
                        let _ = std::process::Command::new("xattr")
                            .args(["-cr", &sidecar_path.to_string_lossy().to_string()]).output();
                        let _ = std::process::Command::new("chmod")
                            .args(["+x", &sidecar_path.to_string_lossy().to_string()]).output();
                        if let Some(app_dir) = macos_dir.parent().and_then(|c| c.parent()) {
                            let _ = std::process::Command::new("xattr")
                                .args(["-cr", &app_dir.to_string_lossy().to_string()]).output();
                        }
                    }
                }
            }

            let mut envs: HashMap<String, String> = HashMap::new();
            envs.insert("PORT".into(), port.to_string());
            envs.insert("DB_PROVIDER".into(), "file".into());
            envs.insert("DB_FILE_PATH".into(), db_path);
            envs.insert("REQUIRE_AUTH".into(), "false".into());

            match app.shell().sidecar("api-server") {
                Ok(cmd) => {
                    let cmd = cmd.envs(envs);
                    match cmd.spawn() {
                        Ok((mut rx, child)) => {
                            *sidecar_child.lock().unwrap() = Some(child);
                            let err_clone = sidecar_error.clone();
                            tauri::async_runtime::spawn(async move {
                                while let Some(event) = rx.recv().await {
                                    match event {
                                        CommandEvent::Stderr(line) => {
                                            let msg = String::from_utf8_lossy(&line).to_string();
                                            eprintln!("[sidecar stderr] {}", msg);
                                            let mut e = err_clone.lock().unwrap();
                                            let current = e.get_or_insert_with(String::new);
                                            if current.len() < 4000 { current.push_str(&msg); current.push('\n'); }
                                        }
                                        CommandEvent::Stdout(line) => {
                                            eprintln!("[sidecar stdout] {}", String::from_utf8_lossy(&line));
                                        }
                                        CommandEvent::Terminated(payload) => {
                                            let msg = format!("Sidecar exited code={:?} signal={:?}", payload.code, payload.signal);
                                            eprintln!("{}", msg);
                                            let mut e = err_clone.lock().unwrap();
                                            e.get_or_insert_with(String::new).push_str(&msg);
                                        }
                                        _ => {}
                                    }
                                }
                            });
                        }
                        Err(e) => {
                            let msg = format!("Failed to spawn sidecar: {}", e);
                            eprintln!("{}", msg);
                            *sidecar_error.lock().unwrap() = Some(msg);
                        }
                    }
                }
                Err(e) => {
                    let msg = format!("Failed to find sidecar binary: {}", e);
                    eprintln!("{}", msg);
                    *sidecar_error.lock().unwrap() = Some(msg);
                }
            }

            app.manage(SidecarPort(port));
            app.manage(SidecarError(sidecar_error));
            app.manage(SidecarChild(sidecar_child));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_sidecar_port,
            get_sidecar_error,
            proxy_request,
            proxy_upload,
            kill_sidecar,
            check_for_update,
            download_and_install_update,
            restart_app
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| match event {
            tauri::RunEvent::Exit => {
                if let Some(state) = app_handle.try_state::<SidecarChild>() {
                    kill_sidecar_process(&state.0);
                }
            }
            tauri::RunEvent::ExitRequested { .. } => {
                if let Some(state) = app_handle.try_state::<SidecarChild>() {
                    kill_sidecar_process(&state.0);
                }
            }
            _ => {}
        });
}
