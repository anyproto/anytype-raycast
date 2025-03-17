import { getPreferenceValues, Image } from "@raycast/api";
import { MemberRole } from "../models";

/**
 * Simple utility for pluralizing words.
 */
export function pluralize(
  count: number,
  noun: string,
  { suffix = "s", withNumber = false }: { suffix?: string; withNumber?: boolean } = {},
): string {
  const pluralizedNoun = `${noun}${count !== 1 ? suffix : ""}`;
  return withNumber ? `${count} ${pluralizedNoun}` : pluralizedNoun;
}

/**
 * Get the label for the date field based on the sort preference.
 */
export function getDateLabel(): string | undefined {
  const { sort } = getPreferenceValues();
  switch (sort) {
    case "created_date":
      return "Created Date";
    case "last_modified_date":
      return "Last Modified Date";
    case "last_opened_date":
      return "Last Opened Date";
    default:
      return undefined;
  }
}

/**
 * Get the short date label based on the sort preference.
 */
export function getShortDateLabel(): string {
  const { sort } = getPreferenceValues();
  switch (sort) {
    case "created_date":
      return "Created";
    case "last_modified_date":
      return "Modified";
    case "last_opened_date":
      return "Opened";
    default:
      return "Date";
  }
}

/**
 * Format the member role to readable representation.
 */
export function formatMemberRole(role: string): string {
  return role
    .replace(MemberRole.Reader, "Viewer")
    .replace(MemberRole.Writer, "Editor")
    .replace(MemberRole.Owner, "Owner")
    .replace(MemberRole.NoPermissions, "No Permissions");
}

/**
 * Injects an emoji into the first markdown heading if the emoji is valid.
 *
 * @param markdown The markdown content.
 * @param icon The icon string to inject (if it's a valid emoji).
 * @returns The updated markdown with the emoji injected into the heading.
 */
export function injectEmojiIntoHeading(markdown: string, icon?: Image.ImageLike): string {
  if (typeof icon !== "string") return markdown;
  const trimmedIcon = icon.trim();
  // Check if the trimmed icon has exactly 2 code units (for surrogate pairs)
  if (trimmedIcon.length !== 2) return markdown;
  return markdown.replace(/^(#+) (.*)/, (_, hashes, heading) => `${hashes} ${trimmedIcon} ${heading}`);
}
