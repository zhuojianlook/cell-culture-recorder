export function compactText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function requiredText(value: FormDataEntryValue | null, label: string): string {
  const compacted = compactText(value);
  if (!compacted) {
    throw new Error(`${label} is required.`);
  }
  return compacted;
}

export function nullableNumber(value: FormDataEntryValue | null): number | null {
  const compacted = compactText(value);
  if (!compacted) {
    return null;
  }

  const parsed = Number(compacted);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Expected a number, received "${compacted}".`);
  }

  return parsed;
}

export function requiredNumber(value: FormDataEntryValue | null, label: string): number {
  const parsed = nullableNumber(value);
  if (parsed === null) {
    throw new Error(`${label} is required.`);
  }
  return parsed;
}

export function nowIsoMinute(): string {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString().slice(0, 16);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function displayDate(value: string | null): string {
  if (!value) {
    return "No date";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: value.length > 10 ? "2-digit" : undefined,
    minute: value.length > 10 ? "2-digit" : undefined,
  }).format(parsed);
}

export function escapeHtml(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function downloadJson(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  setTimeout(() => URL.revokeObjectURL(url), 500);
}
