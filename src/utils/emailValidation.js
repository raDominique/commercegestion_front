export function isCompleteEmail(value) {
  return /^\S+@\S+\.\S+$/.test(String(value || '').trim());
}
