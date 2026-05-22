use tauri_plugin_sql::{Migration, MigrationKind};

const DB_URL: &str = "sqlite:cell-culture-recorder.db";

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(DB_URL, migrations())
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
