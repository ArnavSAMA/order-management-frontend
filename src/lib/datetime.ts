export function nowYMDHMS() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}
