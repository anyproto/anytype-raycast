import { describe, expect, it, vi } from "vitest";
import { ViewType } from "../../components/ObjectList";
import { BodyFormat } from "../../models";
import {
  anytypeSpaceDeeplink,
  apiEndpoints,
  colorToHex,
  defaultTintColor,
  hexToColor,
  localStorageKeys,
} from "../constant";

// Mock getPreferenceValues
vi.mock("@raycast/api", () => ({
  getPreferenceValues: vi.fn(() => ({
    apiUrl: "https://custom-api.anytype.io",
  })),
}));

describe("anytypeSpaceDeeplink", () => {
  it("should generate correct deeplink for space", () => {
    const spaceId = "test-space-123";
    const result = anytypeSpaceDeeplink(spaceId);
    expect(result).toBe("anytype://main/object/_blank_/space.id/test-space-123");
  });

  it("should handle empty spaceId", () => {
    const result = anytypeSpaceDeeplink("");
    expect(result).toBe("anytype://main/object/_blank_/space.id/");
  });
});

describe("localStorageKeys", () => {
  it("should return correct suffix for views per space", () => {
    const result = localStorageKeys.suffixForViewsPerSpace("space123", ViewType.pages);
    expect(result).toBe("space123_Page");
  });

  it("should return correct pinned objects key", () => {
    const result = localStorageKeys.pinnedObjectsWith("test-suffix");
    expect(result).toBe("pinned_objects_test-suffix");
  });

  it("should have correct static keys", () => {
    expect(localStorageKeys.apiKey).toBe("api_key");
    expect(localStorageKeys.suffixForSpaces).toBe("spaces");
    expect(localStorageKeys.suffixForGlobalSearch).toBe("global_search");
  });
});

describe("apiEndpoints", () => {
  it("should generate correct auth endpoints", () => {
    const createChallenge = apiEndpoints.createChallenge();
    expect(createChallenge).toEqual({
      url: "https://custom-api.anytype.io/v1/auth/challenges",
      method: "POST",
    });

    const createApiKey = apiEndpoints.createApiKey();
    expect(createApiKey).toEqual({
      url: "https://custom-api.anytype.io/v1/auth/api_keys",
      method: "POST",
    });
  });

  it("should generate correct object endpoints", () => {
    const getObject = apiEndpoints.getObject("space1", "object1", BodyFormat.JSON);
    expect(getObject).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/objects/object1?format=json",
      method: "GET",
    });

    const createObject = apiEndpoints.createObject("space1");
    expect(createObject).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/objects",
      method: "POST",
    });

    const updateObject = apiEndpoints.updateObject("space1", "object1");
    expect(updateObject).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/objects/object1",
      method: "PATCH",
    });

    const deleteObject = apiEndpoints.deleteObject("space1", "object1");
    expect(deleteObject).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/objects/object1",
      method: "DELETE",
    });
  });

  it("should generate correct list endpoints with query params", () => {
    const getListViews = apiEndpoints.getListViews("space1", "list1", { offset: 10, limit: 20 });
    expect(getListViews).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/lists/list1/views?offset=10&limit=20",
      method: "GET",
    });

    const getObjectsInList = apiEndpoints.getObjectsInList("space1", "list1", "view1", { offset: 0, limit: 50 });
    expect(getObjectsInList).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/lists/list1/views/view1/objects?offset=0&limit=50",
      method: "GET",
    });
  });

  it("should generate correct space endpoints", () => {
    const getSpace = apiEndpoints.getSpace("space1");
    expect(getSpace).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1",
      method: "GET",
    });

    const getSpaces = apiEndpoints.getSpaces({ offset: 0, limit: 10 });
    expect(getSpaces).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces?offset=0&limit=10",
      method: "GET",
    });
  });

  it("should generate correct search endpoints", () => {
    const search = apiEndpoints.search("space1", { offset: 0, limit: 10 });
    expect(search).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/search?offset=0&limit=10",
      method: "POST",
    });

    const globalSearch = apiEndpoints.globalSearch({ offset: 0, limit: 10 });
    expect(globalSearch).toEqual({
      url: "https://custom-api.anytype.io/v1/search?offset=0&limit=10",
      method: "POST",
    });
  });

  it("should generate correct tag endpoints", () => {
    const getTags = apiEndpoints.getTags("space1", "prop1", { offset: 0, limit: 10 });
    expect(getTags).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/properties/prop1/tags?offset=0&limit=10",
      method: "GET",
    });

    const createTag = apiEndpoints.createTag("space1", "prop1");
    expect(createTag).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/properties/prop1/tags",
      method: "POST",
    });
  });
});

describe("colorToHex", () => {
  it("should map color names to hex values", () => {
    expect(colorToHex.grey).toBe("#b6b6b6");
    expect(colorToHex.yellow).toBe("#ecd91b");
    expect(colorToHex.orange).toBe("#ffb522");
    expect(colorToHex.red).toBe("#f55522");
    expect(colorToHex.pink).toBe("#e51ca0");
    expect(colorToHex.purple).toBe("#ab50cc");
    expect(colorToHex.blue).toBe("#3e58eb");
    expect(colorToHex.ice).toBe("#2aa7ee");
    expect(colorToHex.teal).toBe("#0fc8ba");
    expect(colorToHex.lime).toBe("#5dd400");
  });

  it("should return undefined for unknown color", () => {
    expect(colorToHex["unknown"]).toBeUndefined();
  });
});

describe("hexToColor", () => {
  it("should map hex values to color names", () => {
    expect(hexToColor["#b6b6b6"]).toBe("grey");
    expect(hexToColor["#ecd91b"]).toBe("yellow");
    expect(hexToColor["#ffb522"]).toBe("orange");
    expect(hexToColor["#f55522"]).toBe("red");
    expect(hexToColor["#e51ca0"]).toBe("pink");
    expect(hexToColor["#ab50cc"]).toBe("purple");
    expect(hexToColor["#3e58eb"]).toBe("blue");
    expect(hexToColor["#2aa7ee"]).toBe("ice");
    expect(hexToColor["#0fc8ba"]).toBe("teal");
    expect(hexToColor["#5dd400"]).toBe("lime");
  });

  it("should return undefined for unknown hex", () => {
    expect(hexToColor["#ffffff"]).toBeUndefined();
  });
});

describe("defaultTintColor", () => {
  it("should have correct default tint colors", () => {
    expect(defaultTintColor).toEqual({
      light: "black",
      dark: "white",
    });
  });
});
