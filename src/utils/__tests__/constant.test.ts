import { describe, expect, it, vi } from "vitest";
import { ViewType } from "../../components/ObjectList";
import { BodyFormat } from "../../models";
import {
  anytypeNetwork,
  anytypeSpaceDeeplink,
  apiAppName,
  apiEndpoints,
  apiLimitMax,
  bundledPropKeys,
  bundledTypeKeys,
  colorToHex,
  defaultTintColor,
  downloadUrl,
  errorConnectionMessage,
  hexToColor,
  iconWidth,
  localStorageKeys,
  maxPinnedObjects,
  propKeys,
} from "../constant";

// Mock getPreferenceValues
vi.mock("@raycast/api", () => ({
  getPreferenceValues: vi.fn(() => ({
    apiUrl: "https://custom-api.anytype.io",
    limit: 20,
  })),
}));

describe("constants", () => {
  it("should have correct string constants", () => {
    expect(apiAppName).toBe("raycast_v4_0525");
    expect(anytypeNetwork).toBe("N83gJpVd9MuNRZAuJLZ7LiMntTThhPc6DtzWWVjb1M3PouVU");
    expect(errorConnectionMessage).toBe("Can't connect to API. Please ensure Anytype is running and reachable.");
    expect(downloadUrl).toBe("https://download.anytype.io/");
  });

  it("should have correct number constants", () => {
    expect(apiLimitMax).toBe(1000);
    expect(iconWidth).toBe(64);
    expect(maxPinnedObjects).toBe(5);
  });
});

describe("anytypeSpaceDeeplink", () => {
  it("should generate correct deeplink for space", () => {
    const spaceId = "test-space-123";
    const result = anytypeSpaceDeeplink(spaceId);
    expect(result).toBe("anytype://main/object/_blank_/spaceId/test-space-123");
  });

  it("should handle empty spaceId", () => {
    const result = anytypeSpaceDeeplink("");
    expect(result).toBe("anytype://main/object/_blank_/spaceId/");
  });
});

describe("localStorageKeys", () => {
  it("should return correct suffix for views per space", () => {
    const result = localStorageKeys.suffixForViewsPerSpace("space123", ViewType.pages);
    expect(result).toBe("space123_Page");
  });

  it("should return correct suffix for different view types", () => {
    expect(localStorageKeys.suffixForViewsPerSpace("space1", ViewType.objects)).toBe("space1_Object");
    expect(localStorageKeys.suffixForViewsPerSpace("space1", ViewType.types)).toBe("space1_Type");
    expect(localStorageKeys.suffixForViewsPerSpace("space1", ViewType.properties)).toBe("space1_Property");
    expect(localStorageKeys.suffixForViewsPerSpace("space1", ViewType.members)).toBe("space1_Member");
  });

  it("should return correct pinned objects key", () => {
    const result = localStorageKeys.pinnedObjectsWith("test-suffix");
    expect(result).toBe("pinned_objects_test-suffix");
  });

  it("should return correct pinned objects key with empty suffix", () => {
    const result = localStorageKeys.pinnedObjectsWith("");
    expect(result).toBe("pinned_objects_");
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

    const getTag = apiEndpoints.getTag("space1", "prop1", "tag1");
    expect(getTag).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/properties/prop1/tags/tag1",
      method: "GET",
    });

    const updateTag = apiEndpoints.updateTag("space1", "prop1", "tag1");
    expect(updateTag).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/properties/prop1/tags/tag1",
      method: "PATCH",
    });

    const deleteTag = apiEndpoints.deleteTag("space1", "prop1", "tag1");
    expect(deleteTag).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/properties/prop1/tags/tag1",
      method: "DELETE",
    });
  });

  it("should generate correct member endpoints", () => {
    const getMember = apiEndpoints.getMember("space1", "member1");
    expect(getMember).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/members/member1",
      method: "GET",
    });

    const getMembers = apiEndpoints.getMembers("space1", { offset: 0, limit: 10 });
    expect(getMembers).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/members?offset=0&limit=10",
      method: "GET",
    });

    const updateMember = apiEndpoints.updateMember("space1", "member1");
    expect(updateMember).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/members/member1",
      method: "PATCH",
    });
  });

  it("should generate correct type endpoints", () => {
    const getType = apiEndpoints.getType("space1", "type1");
    expect(getType).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/types/type1",
      method: "GET",
    });

    const getTypes = apiEndpoints.getTypes("space1", { offset: 0, limit: 10 });
    expect(getTypes).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/types?offset=0&limit=10",
      method: "GET",
    });

    const createType = apiEndpoints.createType("space1");
    expect(createType).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/types",
      method: "POST",
    });

    const updateType = apiEndpoints.updateType("space1", "type1");
    expect(updateType).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/types/type1",
      method: "PATCH",
    });

    const deleteType = apiEndpoints.deleteType("space1", "type1");
    expect(deleteType).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/types/type1",
      method: "DELETE",
    });
  });

  it("should generate correct template endpoints", () => {
    const getTemplate = apiEndpoints.getTemplate("space1", "type1", "template1");
    expect(getTemplate).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/types/type1/templates/template1",
      method: "GET",
    });

    const getTemplates = apiEndpoints.getTemplates("space1", "type1", { offset: 0, limit: 10 });
    expect(getTemplates).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/types/type1/templates?offset=0&limit=10",
      method: "GET",
    });
  });

  it("should generate correct property endpoints", () => {
    const getProperties = apiEndpoints.getProperties("space1", { offset: 0, limit: 10 });
    expect(getProperties).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/properties?offset=0&limit=10",
      method: "GET",
    });

    const getProperty = apiEndpoints.getProperty("space1", "prop1");
    expect(getProperty).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/properties/prop1",
      method: "GET",
    });

    const createProperty = apiEndpoints.createProperty("space1");
    expect(createProperty).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/properties",
      method: "POST",
    });

    const updateProperty = apiEndpoints.updateProperty("space1", "prop1");
    expect(updateProperty).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/properties/prop1",
      method: "PATCH",
    });

    const deleteProperty = apiEndpoints.deleteProperty("space1", "prop1");
    expect(deleteProperty).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/properties/prop1",
      method: "DELETE",
    });
  });

  it("should generate correct list endpoints", () => {
    const addObjectsToList = apiEndpoints.addObjectsToList("space1", "list1");
    expect(addObjectsToList).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/lists/list1/objects",
      method: "POST",
    });

    const removeObjectsFromList = apiEndpoints.removeObjectsFromList("space1", "list1", "object1");
    expect(removeObjectsFromList).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/lists/list1/objects/object1",
      method: "DELETE",
    });
  });

  it("should generate correct object export endpoint", () => {
    const getExport = apiEndpoints.getExport("space1", "object1", "markdown");
    expect(getExport).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/objects/object1/markdown",
      method: "GET",
    });
  });

  it("should generate correct space endpoints", () => {
    const createSpace = apiEndpoints.createSpace;
    expect(createSpace).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces",
      method: "POST",
    });

    const updateSpace = apiEndpoints.updateSpace("space1");
    expect(updateSpace).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1",
      method: "PATCH",
    });
  });

  it("should generate correct objects endpoint with pagination", () => {
    const getObjects = apiEndpoints.getObjects("space1", { offset: 20, limit: 50 });
    expect(getObjects).toEqual({
      url: "https://custom-api.anytype.io/v1/spaces/space1/objects?offset=20&limit=50",
      method: "GET",
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

describe("bundledPropKeys", () => {
  it("should have all required bundled property keys", () => {
    expect(bundledPropKeys.name).toBe("name");
    expect(bundledPropKeys.description).toBe("description");
    expect(bundledPropKeys.type).toBe("type");
    expect(bundledPropKeys.addedDate).toBe("added_date");
    expect(bundledPropKeys.createdDate).toBe("created_date");
    expect(bundledPropKeys.createdBy).toBe("creator");
    expect(bundledPropKeys.lastModifiedDate).toBe("last_modified_date");
    expect(bundledPropKeys.lastModifiedBy).toBe("last_modified_by");
    expect(bundledPropKeys.lastOpenedDate).toBe("last_opened_date");
    expect(bundledPropKeys.links).toBe("links");
    expect(bundledPropKeys.backlinks).toBe("backlinks");
    expect(bundledPropKeys.source).toBe("source");
  });
});

describe("propKeys", () => {
  it("should have correct property keys", () => {
    expect(propKeys.tag).toBe("tag");
  });
});

describe("bundledTypeKeys", () => {
  it("should have all bundled type keys", () => {
    expect(bundledTypeKeys.audio).toBe("audio");
    expect(bundledTypeKeys.bookmark).toBe("bookmark");
    expect(bundledTypeKeys.chat).toBe("chat");
    expect(bundledTypeKeys.collection).toBe("collection");
    expect(bundledTypeKeys.file).toBe("file");
    expect(bundledTypeKeys.note).toBe("note");
    expect(bundledTypeKeys.image).toBe("image");
    expect(bundledTypeKeys.object_type).toBe("object_type");
    expect(bundledTypeKeys.page).toBe("page");
    expect(bundledTypeKeys.participant).toBe("participant");
    expect(bundledTypeKeys.profile).toBe("profile");
    expect(bundledTypeKeys.set).toBe("set");
    expect(bundledTypeKeys.tag).toBe("tag");
    expect(bundledTypeKeys.task).toBe("task");
    expect(bundledTypeKeys.template).toBe("template");
    expect(bundledTypeKeys.video).toBe("video");
  });
});
