import { getPreferenceValues } from "@raycast/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getObjectWithoutMappedProperties } from "../api";
import {
  BodyFormat,
  Color,
  IconFormat,
  ObjectIcon,
  ObjectLayout,
  PropertyFormat,
  PropertyWithValue,
  RawProperty,
  RawSpaceObject,
  RawSpaceObjectWithBody,
  RawTag,
  RawType,
  SortProperty,
  SpaceObjectWithBody,
} from "../models";
import { bundledPropKeys, getIconWithFallback, propKeys } from "../utils";
import { mapObject, mapObjects, mapObjectWithoutProperties } from "./objects";
import { getIconForProperty, mapProperties, mapProperty, mapTag, mapTags } from "./properties";

// Mock dependencies
vi.mock("@raycast/api", () => ({
  getPreferenceValues: vi.fn(),
  Image: {},
}));

vi.mock("../utils", () => ({
  bundledPropKeys: { source: "source" },
  propKeys: { tag: "tag" },
  getIconWithFallback: vi.fn(),
  colorToHex: {
    [Color.Grey]: "#808080",
    [Color.Yellow]: "#FFFF00",
    [Color.Orange]: "#FFA500",
    [Color.Red]: "#FF0000",
    [Color.Pink]: "#FFC0CB",
    [Color.Purple]: "#800080",
    [Color.Blue]: "#0000FF",
    [Color.Ice]: "#00FFFF",
    [Color.Teal]: "#008080",
    [Color.Lime]: "#00FF00",
  },
}));

vi.mock("../api", () => ({
  getObjectWithoutMappedProperties: vi.fn(),
}));

vi.mock("./types", () => ({
  mapType: vi.fn().mockImplementation((type) => ({
    ...type,
    name: type.name || "Unknown Type",
  })),
}));

// Create shared test data
const mockIcon: ObjectIcon = {
  format: IconFormat.Emoji,
  emoji: "📄",
};

const mockType: RawType = {
  object: "type",
  id: "type1",
  key: "document",
  name: "Document",
  plural_name: "Documents",
  icon: mockIcon,
  layout: ObjectLayout.Basic,
  archived: false,
  properties: [],
};

describe("mappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("objects mapper", () => {
    describe("mapObjects", () => {
      const mockRawObject: RawSpaceObject = {
        object: "object",
        id: "obj1",
        space_id: "space1",
        name: "Test Object",
        icon: mockIcon,
        layout: ObjectLayout.Basic,
        snippet: "Test snippet",
        type: mockType,
        archived: false,
        properties: [
          {
            id: "prop1",
            key: SortProperty.LastModifiedDate,
            name: "Modified",
            format: PropertyFormat.Date,
            date: "2024-01-01",
          },
          { id: "prop2", key: propKeys.tag, name: "Tags", format: PropertyFormat.MultiSelect, multi_select: [] },
          {
            id: "prop3",
            key: bundledPropKeys.source,
            name: "Source",
            format: PropertyFormat.Url,
            url: "http://example.com",
          },
        ],
      };

      it("should map objects with sort by LastModifiedDate", async () => {
        vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastModifiedDate });
        vi.mocked(getIconWithFallback).mockResolvedValue("mapped-icon");

        const result = await mapObjects([mockRawObject]);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          id: "obj1",
          name: "Test Object",
          icon: "mapped-icon",
        });
        expect(result[0].properties).toHaveLength(3); // Modified, tag, source
      });

      it("should map objects with sort by Name", async () => {
        vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.Name });
        vi.mocked(getIconWithFallback).mockResolvedValue("mapped-icon");

        const result = await mapObjects([mockRawObject]);

        // When sort is Name, only LastModifiedDate is kept
        expect(result[0].properties).toHaveLength(1);
        expect(result[0].properties[0].key).toBe(SortProperty.LastModifiedDate);
      });

      it("should handle object without name using snippet", async () => {
        const objectWithoutName: RawSpaceObject = { ...mockRawObject, name: "", snippet: "First line\nSecond line" };
        vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastModifiedDate });
        vi.mocked(getIconWithFallback).mockResolvedValue("mapped-icon");

        const result = await mapObjects([objectWithoutName]);

        expect(result[0].name).toBe("First line...");
      });

      it("should handle object with empty name and single-line snippet", async () => {
        const objectWithoutName: RawSpaceObject = { ...mockRawObject, name: "", snippet: "Single line snippet" };
        vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastModifiedDate });
        vi.mocked(getIconWithFallback).mockResolvedValue("mapped-icon");

        const result = await mapObjects([objectWithoutName]);

        expect(result[0].name).toBe("Single line snippet");
      });

      it("should handle object with empty name and snippet", async () => {
        const objectWithoutName: RawSpaceObject = { ...mockRawObject, name: "", snippet: "" };
        vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastModifiedDate });
        vi.mocked(getIconWithFallback).mockResolvedValue("mapped-icon");

        const result = await mapObjects([objectWithoutName]);

        expect(result[0].name).toBe("Untitled");
      });

      it("should trim whitespace from object name", async () => {
        const objectWithWhitespace: RawSpaceObject = { ...mockRawObject, name: "  Trimmed Name  " };
        vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastModifiedDate });
        vi.mocked(getIconWithFallback).mockResolvedValue("mapped-icon");

        const result = await mapObjects([objectWithWhitespace]);

        expect(result[0].name).toBe("Trimmed Name");
      });
    });

    describe("mapObject", () => {
      it("should map all property formats correctly", async () => {
        const rawObject: RawSpaceObjectWithBody = {
          object: "object",
          id: "obj1",
          space_id: "space1",
          name: "Test Object",
          icon: mockIcon,
          layout: ObjectLayout.Basic,
          snippet: "",
          type: mockType,
          archived: false,
          markdown: "# Test",
          properties: [
            { id: "txt1", key: "text", name: "Text", format: PropertyFormat.Text, text: "  Hello  " },
            { id: "num1", key: "number", name: "Number", format: PropertyFormat.Number, number: 42 },
            {
              id: "sel1",
              key: "select",
              name: "Select",
              format: PropertyFormat.Select,
              select: { id: "tag1", key: "tag1", name: "Tag", color: Color.Red },
            },
            {
              id: "mul1",
              key: "multi",
              name: "Multi",
              format: PropertyFormat.MultiSelect,
              multi_select: [{ id: "tag2", key: "tag2", name: "Tag2", color: Color.Blue }],
            },
            { id: "dat1", key: "date", name: "Date", format: PropertyFormat.Date, date: "2024-01-01T00:00:00Z" },
            { id: "fil1", key: "files", name: "Files", format: PropertyFormat.Files, files: ["file1"] },
            { id: "chk1", key: "checkbox", name: "Check", format: PropertyFormat.Checkbox, checkbox: true },
            { id: "url1", key: "url", name: "URL", format: PropertyFormat.Url, url: "  http://example.com  " },
            { id: "eml1", key: "email", name: "Email", format: PropertyFormat.Email, email: "  test@example.com  " },
            { id: "pho1", key: "phone", name: "Phone", format: PropertyFormat.Phone, phone: "  +1234567890  " },
            { id: "obj1", key: "objects", name: "Objects", format: PropertyFormat.Objects, objects: ["obj2"] },
          ],
        };

        vi.mocked(getIconWithFallback).mockResolvedValue("mapped-icon");
        vi.mocked(getObjectWithoutMappedProperties).mockResolvedValue({
          id: "mapped-obj",
          name: "Mapped Object",
        } as SpaceObjectWithBody);

        const result = await mapObject(rawObject);

        expect(result.icon).toBe("mapped-icon");
        expect(result.name).toBe("Test Object");

        // Check each property format
        const props = result.properties as PropertyWithValue[];
        expect(props.find((p) => p.key === "text")?.text).toBe("Hello");
        expect(props.find((p) => p.key === "number")?.number).toBe(42);
        expect(props.find((p) => p.key === "select")?.select?.name).toBe("Tag");
        expect(props.find((p) => p.key === "multi")?.multi_select?.[0].name).toBe("Tag2");
        expect(props.find((p) => p.key === "date")?.date).toBe("2024-01-01T00:00:00.000Z");
        expect(props.find((p) => p.key === "files")?.files).toHaveLength(1);
        expect(props.find((p) => p.key === "checkbox")?.checkbox).toBe(true);
        expect(props.find((p) => p.key === "url")?.url).toBe("http://example.com");
        expect(props.find((p) => p.key === "email")?.email).toBe("test@example.com");
        expect(props.find((p) => p.key === "phone")?.phone).toBe("+1234567890");
        expect(props.find((p) => p.key === "objects")?.objects).toHaveLength(1);
      });

      it("should handle null/undefined property values", async () => {
        const rawObject: RawSpaceObject = {
          object: "object",
          id: "obj1",
          space_id: "space1",
          name: "Test",
          icon: mockIcon,
          layout: ObjectLayout.Basic,
          snippet: "",
          type: mockType,
          archived: false,
          properties: [
            { id: "num2", key: "number", name: "Number", format: PropertyFormat.Number, number: undefined },
            { id: "txt2", key: "text", name: "Text", format: PropertyFormat.Text, text: undefined },
            { id: "chk2", key: "checkbox", name: "Check", format: PropertyFormat.Checkbox, checkbox: undefined },
            { id: "dat2", key: "date", name: "Date", format: PropertyFormat.Date, date: undefined },
          ],
        };

        vi.mocked(getIconWithFallback).mockResolvedValue("icon");

        const result = await mapObject(rawObject);
        const props = result.properties as PropertyWithValue[];

        expect(props.find((p) => p.key === "number")?.number).toBe(0);
        expect(props.find((p) => p.key === "text")?.text).toBe("");
        expect(props.find((p) => p.key === "checkbox")?.checkbox).toBe(false);
        expect(props.find((p) => p.key === "date")?.date).toBe("");
      });

      it("should warn about unknown property format", async () => {
        const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

        const rawObject: RawSpaceObject = {
          object: "object",
          id: "obj1",
          space_id: "space1",
          name: "Test",
          icon: mockIcon,
          layout: ObjectLayout.Basic,
          snippet: "",
          type: mockType,
          archived: false,
          properties: [{ id: "unk1", key: "unknown", name: "Unknown", format: "UnknownFormat" as PropertyFormat }],
        };

        vi.mocked(getIconWithFallback).mockResolvedValue("icon");

        await mapObject(rawObject);

        expect(consoleSpy).toHaveBeenCalledWith("Unknown property format: 'UnknownFormat' for property 'unknown'");

        consoleSpy.mockRestore();
      });
    });

    describe("mapObjectWithoutProperties", () => {
      it("should map string array to objects", async () => {
        const mockMappedObject = { id: "obj1", name: "Mapped Object" } as SpaceObjectWithBody;
        vi.mocked(getObjectWithoutMappedProperties).mockResolvedValue(mockMappedObject as SpaceObjectWithBody);

        const result = await mapObjectWithoutProperties("space1", ["obj1", "obj2"]);

        expect(result).toHaveLength(2);
        expect(getObjectWithoutMappedProperties).toHaveBeenCalledTimes(2);
        expect(getObjectWithoutMappedProperties).toHaveBeenCalledWith("space1", "obj1", BodyFormat.Markdown);
        expect(getObjectWithoutMappedProperties).toHaveBeenCalledWith("space1", "obj2", BodyFormat.Markdown);
      });

      it("should handle non-string items", async () => {
        const nonStringItem = { id: "existing", name: "Existing Object" };
        const result = await mapObjectWithoutProperties("space1", [nonStringItem as unknown as string]);

        expect(result).toHaveLength(1);
        expect(result[0]).toBe(nonStringItem);
        expect(getObjectWithoutMappedProperties).not.toHaveBeenCalled();
      });

      it("should handle single item not in array", async () => {
        const mockMappedObject = { id: "obj1", name: "Mapped Object" } as SpaceObjectWithBody;
        vi.mocked(getObjectWithoutMappedProperties).mockResolvedValue(mockMappedObject as SpaceObjectWithBody);

        const result = await mapObjectWithoutProperties("space1", "obj1" as unknown as string[]);

        expect(result).toHaveLength(1);
        expect(getObjectWithoutMappedProperties).toHaveBeenCalledWith("space1", "obj1", BodyFormat.Markdown);
      });
    });
  });

  describe("properties mapper", () => {
    describe("mapProperties", () => {
      it("should map multiple properties", () => {
        const rawProperties: RawProperty[] = [
          { object: "property", id: "prop1", key: "key1", name: "Property 1", format: PropertyFormat.Text },
          { object: "property", id: "prop2", key: "key2", name: "  Property 2  ", format: PropertyFormat.Number },
        ];

        const result = mapProperties(rawProperties);

        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("Property 1");
        expect(result[1].name).toBe("Property 2");
        expect(result[0].icon).toBeDefined();
        expect(result[1].icon).toBeDefined();
      });
    });

    describe("mapProperty", () => {
      it("should map property with trimmed name", () => {
        const rawProperty: RawProperty = {
          object: "property",
          id: "prop1",
          key: "key1",
          name: "  Property Name  ",
          format: PropertyFormat.Text,
        };

        const result = mapProperty(rawProperty);

        expect(result.name).toBe("Property Name");
        expect(result.icon).toBeDefined();
      });

      it("should handle property without name", () => {
        const rawProperty: RawProperty = {
          object: "property",
          id: "prop1",
          key: "key1",
          name: "",
          format: PropertyFormat.Text,
        };

        const result = mapProperty(rawProperty);

        expect(result.name).toBe("Untitled");
      });
    });

    describe("getIconForProperty", () => {
      const formats = [
        PropertyFormat.Text,
        PropertyFormat.Number,
        PropertyFormat.Select,
        PropertyFormat.MultiSelect,
        PropertyFormat.Date,
        PropertyFormat.Files,
        PropertyFormat.Checkbox,
        PropertyFormat.Url,
        PropertyFormat.Email,
        PropertyFormat.Phone,
        PropertyFormat.Objects,
      ];

      it.each(formats)("should return icon for %s format", (format) => {
        const result = getIconForProperty(format);

        expect(result).toBeDefined();
        if (typeof result === "object" && result !== null && "source" in result) {
          expect(result).toHaveProperty("tintColor", { light: "grey", dark: "grey" });
          expect(result.source).toContain(`icons/property/`);
        }
      });
    });

    describe("mapTags", () => {
      it("should map multiple tags", () => {
        const rawTags: RawTag[] = [
          { id: "tag1", key: "tag1", name: "Tag 1", color: Color.Red },
          { id: "tag2", key: "tag2", name: "  Tag 2  ", color: Color.Blue },
        ];

        const result = mapTags(rawTags);

        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("Tag 1");
        expect(result[0].color).toBe("#FF0000");
        expect(result[1].name).toBe("Tag 2");
        expect(result[1].color).toBe("#0000FF");
      });
    });

    describe("mapTag", () => {
      it("should map tag with color from colorToHex", () => {
        const rawTag: RawTag = {
          id: "tag1",
          key: "tag1",
          name: "Important",
          color: Color.Red,
        };

        const result = mapTag(rawTag);

        expect(result.name).toBe("Important");
        expect(result.color).toBe("#FF0000");
      });

      it("should use original color if not in colorToHex", () => {
        const rawTag: RawTag = {
          id: "tag1",
          key: "tag1",
          name: "Custom",
          color: Color.Grey,
        };

        const result = mapTag(rawTag);

        expect(result.color).toBe("#808080"); // Grey color from colorToHex
      });

      it("should handle tag without name", () => {
        const rawTag: RawTag = {
          id: "tag1",
          key: "tag1",
          name: "",
          color: Color.Blue,
        };

        const result = mapTag(rawTag);

        expect(result.name).toBe("Untitled");
      });

      it("should trim tag name", () => {
        const rawTag: RawTag = {
          id: "tag1",
          key: "tag1",
          name: "  Trimmed Tag  ",
          color: Color.Lime,
        };

        const result = mapTag(rawTag);

        expect(result.name).toBe("Trimmed Tag");
      });
    });
  });
});
