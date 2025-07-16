import { getPreferenceValues } from "@raycast/api";
import { describe, expect, it, vi } from "vitest";
import { MemberRole, SortProperty } from "../../models";
import {
  formatMemberRole,
  getDateLabel,
  getSectionTitle,
  getShortDateLabel,
  injectEmojiIntoHeading,
  isEmoji,
  pluralize,
} from "../string";

describe("pluralize", () => {
  it("should handle regular pluralization", () => {
    expect(pluralize(1, "item")).toBe("item");
    expect(pluralize(2, "item")).toBe("items");
    expect(pluralize(0, "item")).toBe("items");
  });

  it('should handle words ending in "y"', () => {
    expect(pluralize(1, "category")).toBe("category");
    expect(pluralize(2, "category")).toBe("categories");
    expect(pluralize(1, "city")).toBe("city");
    expect(pluralize(2, "city")).toBe("cities");
  });

  it('should handle words ending in vowel + "y"', () => {
    expect(pluralize(1, "key")).toBe("key");
    expect(pluralize(2, "key")).toBe("keys");
    expect(pluralize(1, "boy")).toBe("boy");
    expect(pluralize(2, "boy")).toBe("boys");
  });

  it("should handle custom suffix", () => {
    expect(pluralize(1, "child", { suffix: "ren" })).toBe("child");
    expect(pluralize(2, "child", { suffix: "ren" })).toBe("children");
  });

  it("should include number when withNumber is true", () => {
    expect(pluralize(1, "item", { withNumber: true })).toBe("1 item");
    expect(pluralize(2, "item", { withNumber: true })).toBe("2 items");
    expect(pluralize(0, "item", { withNumber: true })).toBe("0 items");
    expect(pluralize(3, "category", { withNumber: true })).toBe("3 categories");
  });

  it("should handle both custom suffix and withNumber", () => {
    expect(pluralize(1, "child", { suffix: "ren", withNumber: true })).toBe("1 child");
    expect(pluralize(3, "child", { suffix: "ren", withNumber: true })).toBe("3 children");
  });
});

describe("formatMemberRole", () => {
  it("should format member roles correctly", () => {
    expect(formatMemberRole(MemberRole.Viewer)).toBe("Viewer");
    expect(formatMemberRole(MemberRole.Editor)).toBe("Editor");
    expect(formatMemberRole(MemberRole.Owner)).toBe("Owner");
    expect(formatMemberRole(MemberRole.NoPermissions)).toBe("No Permissions");
  });

  it("should handle unknown roles", () => {
    expect(formatMemberRole("unknown_role")).toBe("unknown_role");
  });

  it("should handle empty string", () => {
    expect(formatMemberRole("")).toBe("");
  });
});

describe("isEmoji", () => {
  it("should correctly identify single emojis", () => {
    expect(isEmoji("😀")).toBe(true);
    expect(isEmoji("🎉")).toBe(true);
    expect(isEmoji("❤️")).toBe(true);
    expect(isEmoji("👍")).toBe(true);
  });

  it("should correctly identify emoji sequences", () => {
    expect(isEmoji("👨‍👩‍👧‍👦")).toBe(true); // Family emoji
    expect(isEmoji("🏳️‍🌈")).toBe(true); // Rainbow flag
    expect(isEmoji("👍🏻")).toBe(true); // Thumbs up with skin tone
  });

  it("should reject non-emojis", () => {
    expect(isEmoji("hello")).toBe(false);
    expect(isEmoji("123")).toBe(false);
    expect(isEmoji("!")).toBe(false);
    expect(isEmoji("")).toBe(false);
    expect(isEmoji(" ")).toBe(false);
  });

  it("should reject mixed content", () => {
    expect(isEmoji("😀 hello")).toBe(false);
    expect(isEmoji("hello 😀")).toBe(false);
    expect(isEmoji("😀😀 ")).toBe(false);
    expect(isEmoji(" 😀")).toBe(false);
  });
});

describe("injectEmojiIntoHeading", () => {
  it("should inject emoji into markdown heading", () => {
    expect(injectEmojiIntoHeading("# My Heading", "😀")).toBe("# 😀 My Heading");
    expect(injectEmojiIntoHeading("## Another Heading", "🎉")).toBe("## 🎉 Another Heading");
    expect(injectEmojiIntoHeading("### Third Level", "❤️")).toBe("### ❤️ Third Level");
  });

  it("should not inject non-emoji strings", () => {
    expect(injectEmojiIntoHeading("# My Heading", "hello")).toBe("# My Heading");
    expect(injectEmojiIntoHeading("# My Heading", "123")).toBe("# My Heading");
    expect(injectEmojiIntoHeading("# My Heading", "")).toBe("# My Heading");
  });

  it("should handle non-string icons", () => {
    expect(injectEmojiIntoHeading("# My Heading", undefined)).toBe("# My Heading");
    expect(injectEmojiIntoHeading("# My Heading", { source: "icon.png" })).toBe("# My Heading");
  });

  it("should handle markdown without headings", () => {
    expect(injectEmojiIntoHeading("Just some text", "😀")).toBe("Just some text");
    expect(injectEmojiIntoHeading("- List item", "😀")).toBe("- List item");
  });

  it("should only inject into the first heading", () => {
    const markdown = "# First Heading\n## Second Heading";
    expect(injectEmojiIntoHeading(markdown, "😀")).toBe("# 😀 First Heading\n## Second Heading");
  });

  it("should handle whitespace in emoji input", () => {
    expect(injectEmojiIntoHeading("# My Heading", " 😀 ")).toBe("# 😀 My Heading");
    expect(injectEmojiIntoHeading("# My Heading", "  🎉  ")).toBe("# 🎉 My Heading");
  });
});

describe("getDateLabel", () => {
  it("should return Creation Date for CreatedDate sort", () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.CreatedDate } as { sort: SortProperty });
    expect(getDateLabel()).toBe("Creation Date");
  });

  it("should return Last Modified Date for LastModifiedDate sort", () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastModifiedDate } as { sort: SortProperty });
    expect(getDateLabel()).toBe("Last Modified Date");
  });

  it("should return Last Opened Date for LastOpenedDate sort", () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastOpenedDate } as { sort: SortProperty });
    expect(getDateLabel()).toBe("Last Opened Date");
  });

  it("should return empty string for other sort types", () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.Name } as { sort: SortProperty });
    expect(getDateLabel()).toBe("");
  });
});

describe("getShortDateLabel", () => {
  it("should return Created for CreatedDate sort", () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.CreatedDate } as { sort: SortProperty });
    expect(getShortDateLabel()).toBe("Created");
  });

  it("should return Modified for LastModifiedDate sort", () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastModifiedDate } as { sort: SortProperty });
    expect(getShortDateLabel()).toBe("Modified");
  });

  it("should return Opened for LastOpenedDate sort", () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastOpenedDate } as { sort: SortProperty });
    expect(getShortDateLabel()).toBe("Opened");
  });

  it("should return empty string for other sort types", () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.Name } as { sort: SortProperty });
    expect(getShortDateLabel()).toBe("");
  });
});

describe("getSectionTitle", () => {
  it("should return Search Results when search text is provided", () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.Name } as { sort: SortProperty });
    expect(getSectionTitle("test search")).toBe("Search Results");
  });

  it("should return Alphabetical Order for Name sort without search", () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.Name } as { sort: SortProperty });
    expect(getSectionTitle("")).toBe("Alphabetical Order");
  });

  it("should return Created Recently for CreatedDate sort without search", () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.CreatedDate } as { sort: SortProperty });
    expect(getSectionTitle("")).toBe("Created Recently");
  });

  it("should return Modified Recently for LastModifiedDate sort without search", () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastModifiedDate } as { sort: SortProperty });
    expect(getSectionTitle("")).toBe("Modified Recently");
  });

  it("should return Opened Recently for LastOpenedDate sort without search", () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastOpenedDate } as { sort: SortProperty });
    expect(getSectionTitle("")).toBe("Opened Recently");
  });
});
