const WORD_CHARACTER = /[\p{L}\p{N}]/u;

function firstCharacter(value) {
  return Array.from(value).find((character) => WORD_CHARACTER.test(character)) || "";
}

/**
 * Builds a compact avatar monogram from a verified display name.
 * Multi-part names use first + final name initials; one-part names use one.
 */
export function getNameInitials(fullName) {
  if (typeof fullName !== "string") return "";

  const parts = fullName.normalize("NFC").trim().split(/\s+/u).filter(Boolean);
  const words = parts.filter((part) => WORD_CHARACTER.test(part));
  if (words.length === 0) return "";

  const first = firstCharacter(words[0]);
  const last = words.length > 1 ? firstCharacter(words[words.length - 1]) : "";

  return (first + last).toLocaleUpperCase();
}
