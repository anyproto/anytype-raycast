import { beforeEach, describe, expect, it, vi } from "vitest";
import { mapObject } from "../../../mappers/objects";
import { mapType } from "../../../mappers/types";
import { BodyFormat, IconFormat, ObjectLayout, SpaceObjectWithBody, Type } from "../../../models";
import {
  createApiResponse,
  createObjectIcon,
  createRawSpaceObjectWithBody,
  createRawType,
  createSpaceObject,
  createType,
  TEST_IDS,
} from "../../../test";
import { apiEndpoints, apiFetch, getNameWithFallback } from "../../../utils";
import { getIconWithFallback } from "../../../utils/icon";
import { getObject, getObjectWithoutMappedProperties, getRawObject } from "../getObject";

vi.mock("../../../utils/api");
vi.mock("../../../mappers/objects");
vi.mock("../../../mappers/types");
vi.mock("../../../utils/icon", () => ({
  getIconWithFallback: vi.fn(),
}));
vi.mock("../../../utils/object", () => ({
  getNameWithFallback: vi.fn(),
}));

const mockApiFetch = vi.mocked(apiFetch);
const mockMapObject = vi.mocked(mapObject);
const mockMapType = vi.mocked(mapType);
const mockGetIconWithFallback = vi.mocked(getIconWithFallback);
const mockGetNameWithFallback = vi.mocked(getNameWithFallback);

describe("getObject", () => {
  const spaceId = TEST_IDS.space;
  const objectId = TEST_IDS.object;
  const format = BodyFormat.Markdown;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getObject", () => {
    it("should fetch and map object successfully", async () => {
      const rawObject = createRawSpaceObjectWithBody({
        id: objectId,
        name: "Test Object",
        markdown: "# Test Content",
      });

      const mappedObject = {
        ...createSpaceObject({
          id: objectId,
          name: "Test Object",
        }),
        markdown: "# Test Content",
      } as SpaceObjectWithBody;

      const mockResponse = createApiResponse({ object: rawObject });
      mockApiFetch.mockResolvedValue(mockResponse);
      mockMapObject.mockResolvedValue(mappedObject);

      const result = await getObject(spaceId, objectId, format);

      expect(mockApiFetch).toHaveBeenCalledWith(apiEndpoints.getObject(spaceId, objectId, format).url, {
        method: apiEndpoints.getObject(spaceId, objectId, format).method,
      });

      expect(mockMapObject).toHaveBeenCalledWith(rawObject);
      expect(result.object).toEqual(mappedObject);
    });

    it("should handle different body formats", async () => {
      const rawObject = createRawSpaceObjectWithBody({
        markdown: "<p>HTML content</p>",
      });

      const mockResponse = createApiResponse({ object: rawObject });
      mockApiFetch.mockResolvedValue(mockResponse);
      mockMapObject.mockResolvedValue(createSpaceObject());

      await getObject(spaceId, objectId, BodyFormat.Markdown);

      expect(mockApiFetch).toHaveBeenCalledWith(
        apiEndpoints.getObject(spaceId, objectId, BodyFormat.Markdown).url,
        expect.any(Object),
      );
    });

    it("should propagate errors from apiFetch", async () => {
      const error = new Error("Not found");
      mockApiFetch.mockRejectedValue(error);

      await expect(getObject(spaceId, objectId, format)).rejects.toThrow("Not found");
    });

    it("should propagate errors from mapObject", async () => {
      const rawObject = createRawSpaceObjectWithBody();
      mockApiFetch.mockResolvedValue(createApiResponse({ object: rawObject }));

      const error = new Error("Mapping failed");
      mockMapObject.mockRejectedValue(error);

      await expect(getObject(spaceId, objectId, format)).rejects.toThrow("Mapping failed");
    });
  });

  describe("getRawObject", () => {
    it("should fetch raw object without mapping", async () => {
      const rawObject = createRawSpaceObjectWithBody({
        id: objectId,
        name: "Raw Object",
        markdown: "Raw content",
      });

      const mockResponse = createApiResponse({ object: rawObject });
      mockApiFetch.mockResolvedValue(mockResponse);

      const result = await getRawObject(spaceId, objectId, format);

      expect(mockApiFetch).toHaveBeenCalledWith(apiEndpoints.getObject(spaceId, objectId, format).url, {
        method: apiEndpoints.getObject(spaceId, objectId, format).method,
      });

      expect(mockMapObject).not.toHaveBeenCalled();
      expect(result.object).toEqual(rawObject);
    });

    it("should handle empty body", async () => {
      const rawObject = createRawSpaceObjectWithBody({
        markdown: "",
      });

      mockApiFetch.mockResolvedValue(createApiResponse({ object: rawObject }));

      const result = await getRawObject(spaceId, objectId, format);
      expect(result.object.markdown).toBe("");
    });
  });

  describe("getObjectWithoutMappedProperties", () => {
    it("should fetch object with minimal mapping", async () => {
      const rawType = createRawType({
        id: "type1",
        name: "Task",
        icon: createObjectIcon({ format: IconFormat.Emoji, emoji: "✅" }),
      });
      const rawObject = createRawSpaceObjectWithBody({
        id: objectId,
        name: "Test Object",
        icon: createObjectIcon({ format: IconFormat.Emoji, emoji: "📄" }),
        layout: ObjectLayout.Basic,
        type: rawType,
        markdown: "Content",
      });

      const mappedType = createType({ id: "type1", name: "Task", icon: "✅" });

      mockApiFetch.mockResolvedValue(createApiResponse({ object: rawObject }));
      mockGetIconWithFallback.mockResolvedValue("📄");
      mockGetNameWithFallback.mockReturnValue("Test Object");
      mockMapType.mockResolvedValue(mappedType);

      const result = await getObjectWithoutMappedProperties(spaceId, objectId, format);

      expect(mockGetIconWithFallback).toHaveBeenCalledWith(rawObject.icon, rawObject.layout, rawObject.type);
      expect(mockGetNameWithFallback).toHaveBeenCalledWith(rawObject.name);
      expect(mockMapType).toHaveBeenCalledWith(rawObject.type);

      expect(result).toMatchObject({
        id: objectId,
        name: "Test Object",
        icon: "📄",
        type: mappedType,
        properties: [], // Empty for performance
        markdown: "", // Empty for performance
      });
    });

    it("should handle missing optional fields", async () => {
      const rawObject = createRawSpaceObjectWithBody({
        id: objectId,
        name: "",
        icon: null,
        type: null,
      });

      mockApiFetch.mockResolvedValue(createApiResponse({ object: rawObject }));
      mockGetIconWithFallback.mockResolvedValue("📄"); // Default icon
      mockGetNameWithFallback.mockReturnValue("Untitled");
      mockMapType.mockResolvedValue(null as unknown as Type);

      const result = await getObjectWithoutMappedProperties(spaceId, objectId, format);

      expect(result.name).toBe("Untitled");
      expect(result.icon).toBe("📄");
      expect(result.type).toBeNull();
      expect(result.properties).toEqual([]);
      expect(result.markdown).toBe("");
    });

    it("should propagate errors from helper functions", async () => {
      const rawObject = createRawSpaceObjectWithBody();
      mockApiFetch.mockResolvedValue(createApiResponse({ object: rawObject }));

      const error = new Error("Icon fetch failed");
      mockGetIconWithFallback.mockRejectedValue(error);

      await expect(getObjectWithoutMappedProperties(spaceId, objectId, format)).rejects.toThrow("Icon fetch failed");
    });
  });
});
