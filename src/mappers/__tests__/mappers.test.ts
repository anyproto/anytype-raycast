import { getPreferenceValues } from "@raycast/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getObjectWithoutMappedProperties } from "../../api";
import {
  Color,
  PropertyFormat,
  PropertyWithValue,
  RawProperty,
  RawTag,
  SortProperty,
  SpaceObjectWithBody,
} from "../../models";
import { createRawSpaceObject, createRawSpaceObjectWithBody, createRawType, TEST_IDS } from "../../test";
import { bundledPropKeys, getIconWithFallback, propKeys } from "../../utils";
import { mapObject, mapObjects, mapObjectWithoutProperties } from "../objects";
import { getIconForProperty, mapProperties, mapProperty, mapTag, mapTags } from "../properties";

vi.mock("@raycast/api", () => ({
  getPreferenceValues: vi.fn(),
  Image: {},
}));

vi.mock("../../utils", () => ({
  bundledPropKeys: { source: "source" },
  propKeys: { tag: "tag" },
  getIconWithFallback: vi.fn(),
  getNameWithFallback: vi.fn((name: string) => name?.trim() || "Untitled"),
  getNameWithSnippetFallback: vi.fn((name: string, snippet: string) => {
    return name?.trim() || (snippet.includes("\n") ? `${snippet.split("\n")[0]}...` : snippet || "Untitled");
  }),
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

vi.mock("../../api", () => ({
  getObjectWithoutMappedProperties: vi.fn(),
}));

vi.mock("../types", () => ({
  mapType: vi.fn().mockImplementation((type) => ({
    ...type,
    name: type.name || "Unknown Type",
  })),
}));

describe("mappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("objects mapper", () => {
    describe("mapObjects", () => {
      const mockType = createRawType({
        id: "type1",
        key: "document",
        name: "Document",
        plural_name: "Documents",
      });

      const mockRawObject = createRawSpaceObject({
        id: TEST_IDS.object,
        space_id: TEST_IDS.space,
        name: "Test Object",
        snippet: "Test snippet",
        type: mockType,
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
      });

      it("should map objects with sort by LastModifiedDate", async () => {
        vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastModifiedDate });
        vi.mocked(getIconWithFallback).mockResolvedValue("mapped-icon");

        const result = await mapObjects([mockRawObject]);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          id: TEST_IDS.object,
          name: "Test Object",
          icon: "mapped-icon",
        });
        expect(result[0].properties).toHaveLength(3);
      });

      it("should map objects with sort by Name", async () => {
        vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.Name });
        vi.mocked(getIconWithFallback).mockResolvedValue("mapped-icon");

        const result = await mapObjects([mockRawObject]);

        expect(result[0].properties).toHaveLength(1);
        expect(result[0].properties[0].key).toBe(SortProperty.LastModifiedDate);
      });

      it("should handle object without name using snippet", async () => {
        const objectWithoutName = createRawSpaceObject({
          ...mockRawObject,
          name: "",
          snippet: "First line\nSecond line",
        });
        vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastModifiedDate });
        vi.mocked(getIconWithFallback).mockResolvedValue("mapped-icon");

        const result = await mapObjects([objectWithoutName]);

        expect(result[0].name).toBe("First line...");
      });

      it("should handle object with empty name and single-line snippet", async () => {
        const objectWithoutName = createRawSpaceObject({
          ...mockRawObject,
          name: "",
          snippet: "Single line snippet",
        });
        vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastModifiedDate });
        vi.mocked(getIconWithFallback).mockResolvedValue("mapped-icon");

        const result = await mapObjects([objectWithoutName]);

        expect(result[0].name).toBe("Single line snippet");
      });

      it("should handle object with empty name and snippet", async () => {
        const objectWithoutName = createRawSpaceObject({
          ...mockRawObject,
          name: "",
          snippet: "",
        });
        vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastModifiedDate });
        vi.mocked(getIconWithFallback).mockResolvedValue("mapped-icon");

        const result = await mapObjects([objectWithoutName]);

        expect(result[0].name).toBe("Untitled");
      });

      it("should trim whitespace from object name", async () => {
        const objectWithWhitespace = createRawSpaceObject({
          ...mockRawObject,
          name: "  Trimmed Name  ",
        });
        vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastModifiedDate });
        vi.mocked(getIconWithFallback).mockResolvedValue("mapped-icon");

        const result = await mapObjects([objectWithWhitespace]);

        expect(result[0].name).toBe("Trimmed Name");
      });
    });

    describe("mapObject", () => {
      const mockType = createRawType();

      it("should map all property formats correctly", async () => {
        const rawObject = createRawSpaceObjectWithBody({
          id: TEST_IDS.object,
          space_id: TEST_IDS.space,
          name: "Test Object",
          type: mockType,
          markdown: "# Test",
          properties: [
            { id: "txt1", key: "text", name: "Text", format: PropertyFormat.Text, text: "  Hello  " },
            { id: "num1", key: "number", name: "Number", format: PropertyFormat.Number, number: 42 },
            {
              id: "sel1",
              key: "select",
              name: "Select",
              format: PropertyFormat.Select,
              select: { id: "tag1", key: "tag1", name: "Tag", color: Color.Red } as RawTag,
            },
            {
              id: "mul1",
              key: "multi",
              name: "Multi",
              format: PropertyFormat.MultiSelect,
              multi_select: [{ id: "tag2", key: "tag2", name: "Tag2", color: Color.Blue } as RawTag],
            },
            { id: "dat1", key: "date", name: "Date", format: PropertyFormat.Date, date: "2024-01-01T00:00:00Z" },
            { id: "fil1", key: "files", name: "Files", format: PropertyFormat.Files, files: ["file1"] },
            { id: "chk1", key: "checkbox", name: "Check", format: PropertyFormat.Checkbox, checkbox: true },
            { id: "url1", key: "url", name: "URL", format: PropertyFormat.Url, url: "  http://example.com  " },
            { id: "eml1", key: "email", name: "Email", format: PropertyFormat.Email, email: "  test@example.com  " },
            { id: "pho1", key: "phone", name: "Phone", format: PropertyFormat.Phone, phone: "  +1234567890  " },
            { id: "obj1", key: "objects", name: "Objects", format: PropertyFormat.Objects, objects: ["obj2"] },
          ],
        });

        vi.mocked(getIconWithFallback).mockResolvedValue("mapped-icon");
        vi.mocked(getObjectWithoutMappedProperties).mockResolvedValue({
          id: "mapped-obj",
          name: "Mapped Object",
        } as SpaceObjectWithBody);

        const result = await mapObject(rawObject);

        expect(result.icon).toBe("mapped-icon");
        expect(result.name).toBe("Test Object");

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
        const rawObject = createRawSpaceObject({
          id: TEST_IDS.object,
          space_id: TEST_IDS.space,
          name: "Test",
          type: mockType,
          properties: [
            { id: "num2", key: "number", name: "Number", format: PropertyFormat.Number, number: undefined },
            { id: "txt2", key: "text", name: "Text", format: PropertyFormat.Text, text: undefined },
            { id: "chk2", key: "checkbox", name: "Check", format: PropertyFormat.Checkbox, checkbox: undefined },
            { id: "dat2", key: "date", name: "Date", format: PropertyFormat.Date, date: undefined },
          ],
        });

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

        const rawObject = createRawSpaceObject({
          id: TEST_IDS.object,
          space_id: TEST_IDS.space,
          name: "Test",
          type: mockType,
          properties: [{ id: "unk1", key: "unknown", name: "Unknown", format: "UnknownFormat" as PropertyFormat }],
        });

        vi.mocked(getIconWithFallback).mockResolvedValue("icon");

        await mapObject(rawObject);

        expect(consoleSpy).toHaveBeenCalledWith("Unknown property format: 'UnknownFormat' for property 'unknown'");

        consoleSpy.mockRestore();
      });
    });

    describe("mapObjectWithoutProperties", () => {
      it("should map object without properties", async () => {
        vi.mocked(getObjectWithoutMappedProperties).mockResolvedValue({
          id: TEST_IDS.object,
          name: "Test Object",
          icon: "mapped-icon",
          properties: [],
        } as unknown as SpaceObjectWithBody);

        const result = await mapObjectWithoutProperties(TEST_IDS.space, [TEST_IDS.object]);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          id: TEST_IDS.object,
          name: "Test Object",
          icon: "mapped-icon",
        });
        expect(result[0].properties).toEqual([]);
      });
    });
  });

  describe("properties mapper", () => {
    describe("mapTags", () => {
      it("should map tags correctly", () => {
        const rawTags: RawTag[] = [
          { id: "tag1", key: "tag1", name: "Tag 1", color: Color.Red },
          { id: "tag2", key: "tag2", name: "Tag 2", color: Color.Blue },
        ];

        const result = mapTags(rawTags);

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({
          id: "tag1",
          name: "Tag 1",
          color: "#FF0000",
        });
        expect(result[1]).toMatchObject({
          id: "tag2",
          name: "Tag 2",
          color: "#0000FF",
        });
      });

      it("should handle undefined tags", () => {
        expect(() => mapTags(undefined as unknown as RawTag[])).toThrow();
      });
    });

    describe("mapTag", () => {
      it("should map single tag correctly", () => {
        const rawTag: RawTag = { id: "tag1", key: "tag1", name: "Tag 1", color: Color.Purple };

        const result = mapTag(rawTag);

        expect(result).toMatchObject({
          id: "tag1",
          name: "Tag 1",
          color: "#800080",
        });
      });

      it("should handle undefined tag", () => {
        expect(() => mapTag(undefined as unknown as RawTag)).toThrow();
      });
    });

    describe("mapProperties", () => {
      it("should map all properties without filtering", () => {
        const properties: RawProperty[] = [
          { id: "1", key: SortProperty.LastModifiedDate, name: "Modified", format: PropertyFormat.Date, object: "" },
          { id: "2", key: "custom", name: "Custom", format: PropertyFormat.Text, object: "" },
          { id: "3", key: propKeys.tag, name: "Tags", format: PropertyFormat.MultiSelect, object: "" },
          { id: "4", key: bundledPropKeys.source, name: "Source", format: PropertyFormat.Url, object: "" },
        ];

        const result = mapProperties(properties);

        expect(result).toHaveLength(4);
      });
    });

    describe("mapProperty", () => {
      it("should add icon and process name for property", () => {
        const property: RawProperty = {
          id: "1",
          key: "date",
          name: "Date Property",
          format: PropertyFormat.Date,
          object: "",
        };

        const result = mapProperty(property);

        expect(result).toMatchObject({
          id: "1",
          key: "date",
          name: "Date Property",
          format: PropertyFormat.Date,
          object: "",
          icon: expect.objectContaining({ source: expect.stringContaining("date.svg") }),
        });
      });

      it("should handle property with empty name", () => {
        const property: RawProperty = {
          id: "1",
          key: "text",
          name: "",
          format: PropertyFormat.Text,
          object: "",
        };

        const result = mapProperty(property);

        expect(result.name).toBe("Untitled");
        expect(result.icon).toMatchObject({ source: expect.stringContaining("text.svg") });
      });
    });

    describe("getIconForProperty", () => {
      it("should return correct icons for property formats", () => {
        expect(getIconForProperty(PropertyFormat.Text)).toMatchObject({ source: expect.stringContaining("text.svg") });
        expect(getIconForProperty(PropertyFormat.Number)).toMatchObject({
          source: expect.stringContaining("number.svg"),
        });
        expect(getIconForProperty(PropertyFormat.Date)).toMatchObject({ source: expect.stringContaining("date.svg") });
        expect(getIconForProperty(PropertyFormat.Checkbox)).toMatchObject({
          source: expect.stringContaining("checkbox.svg"),
        });
        expect(getIconForProperty(PropertyFormat.Files)).toMatchObject({
          source: expect.stringContaining("files.svg"),
        });
        expect(getIconForProperty(PropertyFormat.Email)).toMatchObject({
          source: expect.stringContaining("email.svg"),
        });
        expect(getIconForProperty(PropertyFormat.Phone)).toMatchObject({
          source: expect.stringContaining("phone.svg"),
        });
        expect(getIconForProperty(PropertyFormat.Url)).toMatchObject({ source: expect.stringContaining("url.svg") });
        expect(getIconForProperty(PropertyFormat.Select)).toMatchObject({
          source: expect.stringContaining("select.svg"),
        });
        expect(getIconForProperty(PropertyFormat.MultiSelect)).toMatchObject({
          source: expect.stringContaining("multi_select.svg"),
        });
        expect(getIconForProperty(PropertyFormat.Objects)).toMatchObject({
          source: expect.stringContaining("objects.svg"),
        });
      });

      it("should return undefined for unknown format", () => {
        expect(getIconForProperty("UnknownFormat" as PropertyFormat)).toBeUndefined();
      });
    });
  });
});
