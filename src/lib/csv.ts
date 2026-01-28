// src/lib/csv.ts
export function toCSV(rows: Record<string, any>[]) {
  const escape = (v: any) => {
    const s = String(v ?? "");
    // wrap in quotes if it contains comma, quote, or newline
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];

  return lines.join("\n");
}

export function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
