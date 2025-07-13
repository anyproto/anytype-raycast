import { Icon, Image } from "@raycast/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IconFormat, ObjectIcon, ObjectLayout, RawType } from "../models";
import { fetchWithTimeout, getCustomTypeIcon, getFile, getIconWithFallback, getMaskForObject } from "./icon";

// Mock node-fetch
vi.mock("node-fetch", () => ({
  default: vi.fn(),
}));

import fetch from "node-fetch";

describe("getCustomTypeIcon", () => {
  it("should return icon with color tint", () => {
    const icon = getCustomTypeIcon("document", "blue");
    expect(icon).toEqual({
      source: "icons/type/document.svg",
      tintColor: {
        light: "#3e58eb",
        dark: "#3e58eb",
      },
    });
  });

  it("should use grey color when no color is specified", () => {
    const icon = getCustomTypeIcon("layers");
    expect(icon).toEqual({
      source: "icons/type/layers.svg",
      tintColor: {
        light: "#b6b6b6",
        dark: "#b6b6b6",
      },
    });
  });

  it("should use grey color when undefined color is passed", () => {
    const icon = getCustomTypeIcon("checkbox", undefined);
    expect(icon).toEqual({
      source: "icons/type/checkbox.svg",
      tintColor: {
        light: "#b6b6b6",
        dark: "#b6b6b6",
      },
    });
  });

  it("should handle different icon names", () => {
    const testCases = [
      { name: "person", color: "red", expectedColor: "#f55522" },
      { name: "bookmark", color: "lime", expectedColor: "#5dd400" },
      { name: "extension-puzzle", color: "yellow", expectedColor: "#ecd91b" },
      { name: "copy", color: "purple", expectedColor: "#ab50cc" },
    ];

    testCases.forEach(({ name, color, expectedColor }) => {
      const icon = getCustomTypeIcon(name, color);
      expect(icon).toEqual({
        source: `icons/type/${name}.svg`,
        tintColor: {
          light: expectedColor,
          dark: expectedColor,
        },
      });
    });
  });

  it("should handle unknown colors by falling back to grey", () => {
    const icon = getCustomTypeIcon("document", "unknown-color");
    expect(icon).toEqual({
      source: "icons/type/document.svg",
      tintColor: {
        light: undefined,
        dark: undefined,
      },
    });
  });
});

describe("getMaskForObject", () => {
  it("should return Circle mask for Participant layout", () => {
    const icon = { source: "some-icon.png" };
    const mask = getMaskForObject(icon, ObjectLayout.Participant);
    expect(mask).toBe(Image.Mask.Circle);
  });

  it("should return Circle mask for Profile layout", () => {
    const icon = { source: "some-icon.png" };
    const mask = getMaskForObject(icon, ObjectLayout.Profile);
    expect(mask).toBe(Image.Mask.Circle);
  });

  it("should return RoundedRectangle mask for other layouts", () => {
    const testLayouts = [
      ObjectLayout.Basic,
      ObjectLayout.Action,
      ObjectLayout.Note,
      ObjectLayout.Bookmark,
      ObjectLayout.Set,
      ObjectLayout.Collection,
      "custom-layout",
      "",
    ];

    testLayouts.forEach((layout) => {
      const icon = { source: "some-icon.png" };
      const mask = getMaskForObject(icon, layout);
      expect(mask).toBe(Image.Mask.RoundedRectangle);
    });
  });

  it("should return RoundedRectangle mask when icon is Icon.Document regardless of layout", () => {
    const mask = getMaskForObject(Icon.Document, ObjectLayout.Participant);
    expect(mask).toBe(Image.Mask.RoundedRectangle);
  });

  it("should return RoundedRectangle mask when icon is Icon.Document for Profile layout", () => {
    const mask = getMaskForObject(Icon.Document, ObjectLayout.Profile);
    expect(mask).toBe(Image.Mask.RoundedRectangle);
  });

  it("should handle string icons", () => {
    const mask = getMaskForObject("😀", ObjectLayout.Participant);
    expect(mask).toBe(Image.Mask.Circle);
  });

  it("should handle complex icon objects", () => {
    const icon = {
      source: "icon.png",
      mask: Image.Mask.Circle,
      tintColor: { light: "#000", dark: "#fff" },
    };
    const mask = getMaskForObject(icon, ObjectLayout.Basic);
    expect(mask).toBe(Image.Mask.RoundedRectangle);
  });
});

describe("getIconWithFallback", () => {
  it("should return custom type icon when format is Icon", async () => {
    const icon: ObjectIcon = {
      format: IconFormat.Icon,
      name: "document",
      color: "blue",
    };
    const result = await getIconWithFallback(icon, ObjectLayout.Basic);
    expect(result).toEqual({
      source: "icons/type/document.svg",
      tintColor: {
        light: "#3e58eb",
        dark: "#3e58eb",
      },
    });
  });

  it("should return emoji when format is Emoji", async () => {
    const icon: ObjectIcon = {
      format: IconFormat.Emoji,
      emoji: "😀",
    };
    const result = await getIconWithFallback(icon, ObjectLayout.Basic);
    expect(result).toBe("😀");
  });

  it("should fallback to type icon when no icon provided", async () => {
    const type: RawType = {
      icon: {
        format: IconFormat.Icon,
        name: "layers",
      },
    } as RawType;
    const result = await getIconWithFallback({} as ObjectIcon, ObjectLayout.Basic, type);
    expect(result).toEqual({
      source: "icons/type/layers.svg",
      tintColor: {
        light: "#b6b6b6",
        dark: "#b6b6b6",
      },
    });
  });

  it("should fallback to layout-specific icon for Action layout", async () => {
    const result = await getIconWithFallback({} as ObjectIcon, ObjectLayout.Action);
    expect(result).toEqual({
      source: "icons/type/checkbox.svg",
      tintColor: {
        light: "#b6b6b6",
        dark: "#b6b6b6",
      },
    });
  });

  it("should fallback to layout-specific icon for Set layout", async () => {
    const result = await getIconWithFallback({} as ObjectIcon, ObjectLayout.Set);
    expect(result).toEqual({
      source: "icons/type/layers.svg",
      tintColor: {
        light: "#b6b6b6",
        dark: "#b6b6b6",
      },
    });
  });

  it("should fallback to layout-specific icon for Collection layout", async () => {
    const result = await getIconWithFallback({} as ObjectIcon, ObjectLayout.Collection);
    expect(result).toEqual({
      source: "icons/type/layers.svg",
      tintColor: {
        light: "#b6b6b6",
        dark: "#b6b6b6",
      },
    });
  });

  it("should fallback to layout-specific icon for Participant layout", async () => {
    const result = await getIconWithFallback({} as ObjectIcon, ObjectLayout.Participant);
    expect(result).toEqual({
      source: "icons/type/person.svg",
      tintColor: {
        light: "#b6b6b6",
        dark: "#b6b6b6",
      },
    });
  });

  it("should fallback to layout-specific icon for Bookmark layout", async () => {
    const result = await getIconWithFallback({} as ObjectIcon, ObjectLayout.Bookmark);
    expect(result).toEqual({
      source: "icons/type/bookmark.svg",
      tintColor: {
        light: "#b6b6b6",
        dark: "#b6b6b6",
      },
    });
  });

  it("should fallback to BullsEye icon for space layout", async () => {
    const result = await getIconWithFallback({} as ObjectIcon, "space");
    expect(result).toBe(Icon.BullsEye);
  });

  it("should fallback to copy icon for template layout", async () => {
    const result = await getIconWithFallback({} as ObjectIcon, "template");
    expect(result).toEqual({
      source: "icons/type/copy.svg",
      tintColor: {
        light: "#b6b6b6",
        dark: "#b6b6b6",
      },
    });
  });

  it("should fallback to extension-puzzle icon for type layout", async () => {
    const result = await getIconWithFallback({} as ObjectIcon, "type");
    expect(result).toEqual({
      source: "icons/type/extension-puzzle.svg",
      tintColor: {
        light: "#b6b6b6",
        dark: "#b6b6b6",
      },
    });
  });

  it("should fallback to document icon for unknown layout", async () => {
    const result = await getIconWithFallback({} as ObjectIcon, "unknown-layout");
    expect(result).toEqual({
      source: "icons/type/document.svg",
      tintColor: {
        light: "#b6b6b6",
        dark: "#b6b6b6",
      },
    });
  });
});

describe("fetchWithTimeout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch successfully within timeout", async () => {
    const mockResponse = {
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(Buffer.from("test-image-data")),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as never);

    const result = await fetchWithTimeout("http://example.com/image.png", 1000);
    expect(result).toBe(`data:image/png;base64,${Buffer.from("test-image-data").toString("base64")}`);
    expect(fetch).toHaveBeenCalledWith("http://example.com/image.png", expect.any(Object));
  });

  it("should return undefined when response is not ok", async () => {
    const mockResponse = {
      ok: false,
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as never);

    const result = await fetchWithTimeout("http://example.com/image.png", 1000);
    expect(result).toBeUndefined();
  });

  it("should return undefined when fetch times out", async () => {
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ ok: true } as never), 2000);
        }),
    );

    const result = await fetchWithTimeout("http://example.com/image.png", 100);
    expect(result).toBeUndefined();
  });

  it("should handle fetch errors gracefully", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    const result = await fetchWithTimeout("http://example.com/image.png", 1000);
    expect(result).toBeUndefined();
  });
});

describe("getFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch file from local gateway", async () => {
    const mockResponse = {
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(Buffer.from("test-image-data")),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as never);

    const result = await getFile("http://127.0.0.1:8080/image.png");
    expect(result).toBe(`data:image/png;base64,${Buffer.from("test-image-data").toString("base64")}`);
    expect(fetch).toHaveBeenCalledWith("http://127.0.0.1:8080/image.png?width=64", expect.any(Object));
  });

  it("should return undefined for non-local URLs", async () => {
    const result = await getFile("http://example.com/image.png");
    expect(result).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("should return undefined for empty URL", async () => {
    const result = await getFile("");
    expect(result).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("should return undefined when fetch fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Fetch failed"));

    const result = await getFile("http://127.0.0.1:8080/image.png");
    expect(result).toBeUndefined();
  });
});
