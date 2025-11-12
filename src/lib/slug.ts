import crypto from "node:crypto";

/**
 * @title Slugify
 * @notice Normalises a string into a lowercase, hyphen-separated slug.
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * @title Slugify With Limit
 * @notice Ensures slug values stay below a strict length while remaining unique via a hash suffix.
 * @param input Human-readable text to convert.
 * @param uniqueKey Stable key (e.g., file path) used when hashing long slugs.
 * @param maxLength Maximum allowed length for the slug (defaults to 60).
 */
export function slugifyWithLimit(
  input: string,
  uniqueKey: string,
  maxLength = 60,
): string {
  const base = slugify(input) || "prompt";
  if (base.length <= maxLength) {
    return base;
  }

  const hash = crypto
    .createHash("sha1")
    .update(uniqueKey)
    .digest("hex")
    .slice(0, 8);
  const available = Math.max(1, maxLength - hash.length - 1);
  const trimmed = base.slice(0, available);
  return `${trimmed}-${hash}`;
}

/**
 * @title Title Case Conversion
 * @notice Converts slug/identifier text into human-friendly title case.
 */
export function toTitleCase(input: string): string {
  return input
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
