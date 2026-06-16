export function isValidEnglishName(value: string) {
  const trimmed = value.trim();

  return /^[A-Za-z][A-Za-z .'-]*$/.test(trimmed);
}

export function isValidPhoneNumber(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  return /^\+?[0-9][0-9\s\-()]*$/.test(trimmed) && digits.length >= 7 && digits.length <= 15;
}
