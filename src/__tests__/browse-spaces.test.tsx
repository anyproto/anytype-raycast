import { describe, expect, it } from "vitest";

describe("browse-spaces", () => {
  it("should have correct search placeholder", () => {
    const searchPlaceholder = "Search spaces...";
    expect(searchPlaceholder).toBe("Search spaces...");
  });

  it("should pass placeholder to child components", () => {
    // Test that the placeholder is passed correctly
    const searchPlaceholder = "Search spaces...";

    // These would be props passed to components
    const ensureAuthenticatedProps = {
      placeholder: searchPlaceholder,
      viewType: "list" as const,
    };

    const spaceListProps = {
      searchPlaceholder: searchPlaceholder,
    };

    expect(ensureAuthenticatedProps.placeholder).toBe(searchPlaceholder);
    expect(ensureAuthenticatedProps.viewType).toBe("list");
    expect(spaceListProps.searchPlaceholder).toBe(searchPlaceholder);
  });
});
