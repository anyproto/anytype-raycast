import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../../api";
import { ObjectLayout, Space, Type } from "../../models";
import { createSpace, createType, createTypesResponse, TEST_IDS } from "../../test";
import {
  fetchAllTypesForSpace,
  fetchTypeKeysForLists,
  fetchTypeKeysForPages,
  fetchTypesKeysForTasks,
  getAllTypesFromSpaces,
} from "../type";

// Mock the API module
vi.mock("../../api", () => ({
  getTypes: vi.fn(),
  getTemplates: vi.fn(),
}));

// Mock bundledTypeKeys
vi.mock("../constant", () => ({
  apiLimitMax: 1000,
  bundledTypeKeys: {
    audio: "audio",
    chat: "chat",
    file: "file",
    image: "image",
    object_type: "objectType",
    tag: "tag",
    template: "template",
    video: "video",
    set: "set",
    collection: "collection",
    bookmark: "bookmark",
    participant: "participant",
  },
}));

describe("fetchTypeKeysForPages", () => {
  const mockSpaces: Space[] = [
    createSpace({ id: "space1", name: "Space 1" }),
    createSpace({ id: "space2", name: "Space 2" }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty array when no types exist", async () => {
    vi.mocked(api.getTypes).mockResolvedValue(
      createTypesResponse([], {
        total: 0,
        offset: 0,
        limit: 1000,
        hasMore: false,
      }),
    );

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual([]);
  });

  it("should exclude bundled type keys", async () => {
    const mockTypes: Type[] = [
      createType({ key: "page", layout: ObjectLayout.Basic }),
      createType({ key: "note", layout: ObjectLayout.Note }),
      createType({ key: "audio", layout: ObjectLayout.Basic }), // Should be excluded
      createType({ key: "tag", layout: ObjectLayout.Basic }), // Should be excluded
    ];

    vi.mocked(api.getTypes).mockResolvedValue(
      createTypesResponse(mockTypes, {
        total: 0,
        offset: 0,
        limit: 1000,
        hasMore: false,
      }),
    );

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual(["page", "note"]);
    expect(result).not.toContain("audio");
    expect(result).not.toContain("tag");
  });

  it("should exclude task type keys", async () => {
    const mockTypes: Type[] = [
      createType({ key: "page", layout: ObjectLayout.Basic }),
      createType({ key: "task", layout: ObjectLayout.Action }),
      createType({ key: "custom-task", layout: ObjectLayout.Action }),
    ];

    vi.mocked(api.getTypes).mockResolvedValue(
      createTypesResponse(mockTypes, {
        total: 0,
        offset: 0,
        limit: 1000,
        hasMore: false,
      }),
    );

    const taskKeys = ["task", "custom-task"];
    const result = await fetchTypeKeysForPages(mockSpaces, taskKeys, []);
    expect(result).toEqual(["page"]);
  });

  it("should exclude list type keys", async () => {
    const mockTypes: Type[] = [
      createType({ key: "page", layout: ObjectLayout.Basic }),
      createType({ key: "kanban", layout: ObjectLayout.Set }),
      createType({ key: "gallery", layout: ObjectLayout.Collection }),
    ];

    vi.mocked(api.getTypes).mockResolvedValue(
      createTypesResponse(mockTypes, {
        total: 0,
        offset: 0,
        limit: 1000,
        hasMore: false,
      }),
    );

    const listKeys = ["kanban", "gallery"];
    const result = await fetchTypeKeysForPages(mockSpaces, [], listKeys);
    expect(result).toEqual(["page"]);
  });

  it("should return unique type keys", async () => {
    const mockTypes: Type[] = [
      createType({ key: "page", layout: ObjectLayout.Basic }),
      createType({ key: "page", layout: ObjectLayout.Basic }), // Duplicate
      createType({ key: "note", layout: ObjectLayout.Note }),
      createType({ key: "note", layout: ObjectLayout.Note }), // Duplicate
    ];

    vi.mocked(api.getTypes)
      .mockResolvedValueOnce(
        createTypesResponse(mockTypes.slice(0, 2), {
          total: 0,
          offset: 0,
          limit: 1000,
          hasMore: false,
        }),
      )
      .mockResolvedValueOnce(
        createTypesResponse(mockTypes.slice(2), {
          total: 0,
          offset: 0,
          limit: 1000,
          hasMore: false,
        }),
      );

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual(["page", "note"]);
  });

  it("should handle multiple spaces", async () => {
    const space1Types: Type[] = [
      createType({ key: "page", layout: ObjectLayout.Basic }),
      createType({ key: "note", layout: ObjectLayout.Note }),
    ];
    const space2Types: Type[] = [
      createType({ key: "blog", layout: ObjectLayout.Basic }),
      createType({ key: "article", layout: ObjectLayout.Basic }),
    ];

    vi.mocked(api.getTypes)
      .mockResolvedValueOnce(
        createTypesResponse(space1Types, {
          total: 0,
          offset: 0,
          limit: 1000,
          hasMore: false,
        }),
      )
      .mockResolvedValueOnce(
        createTypesResponse(space2Types, {
          total: 0,
          offset: 0,
          limit: 1000,
          hasMore: false,
        }),
      );

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual(expect.arrayContaining(["page", "note", "blog", "article"]));
    expect(result).toHaveLength(4);
  });

  it("should handle pagination", async () => {
    const firstBatch: Type[] = [createType({ key: "page1", layout: ObjectLayout.Basic })];
    const secondBatch: Type[] = [createType({ key: "page2", layout: ObjectLayout.Basic })];

    vi.mocked(api.getTypes)
      .mockResolvedValueOnce(
        createTypesResponse(firstBatch, {
          total: 2,
          offset: 0,
          limit: 1000,
          hasMore: true,
        }),
      )
      .mockResolvedValueOnce(
        createTypesResponse(secondBatch, {
          total: 0,
          offset: 0,
          limit: 1000,
          hasMore: false,
        }),
      );

    const result = await fetchTypeKeysForPages([mockSpaces[0]], [], []);
    expect(result).toEqual(expect.arrayContaining(["page1", "page2"]));
    expect(result).toHaveLength(2);
  });

  it("should handle errors gracefully", async () => {
    vi.mocked(api.getTypes)
      .mockResolvedValueOnce(
        createTypesResponse([createType({ key: "page", layout: ObjectLayout.Basic })], {
          total: 0,
          offset: 0,
          limit: 1000,
          hasMore: false,
        }),
      )
      .mockRejectedValueOnce(new Error("API Error"));

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual(["page"]); // Should still return results from successful space
  });

  it("should exclude all layout-specific types", async () => {
    const mockTypes: Type[] = [
      createType({ key: "page", layout: ObjectLayout.Basic }),
      createType({ key: "set", layout: ObjectLayout.Set }), // Excluded
      createType({ key: "collection", layout: ObjectLayout.Collection }), // Excluded
      createType({ key: "bookmark", layout: ObjectLayout.Bookmark }), // Excluded
      createType({ key: "participant", layout: ObjectLayout.Participant }), // Excluded
    ];

    vi.mocked(api.getTypes).mockResolvedValue(
      createTypesResponse(mockTypes, {
        total: 0,
        offset: 0,
        limit: 1000,
        hasMore: false,
      }),
    );

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual(["page"]);
  });
});

describe("fetchTypesKeysForTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return only Action layout types", async () => {
    const mockTypes: Type[] = [
      createType({ key: "task", layout: ObjectLayout.Action }),
      createType({ key: "todo", layout: ObjectLayout.Action }),
      createType({ key: "page", layout: ObjectLayout.Basic }),
      createType({ key: "note", layout: ObjectLayout.Note }),
    ];

    vi.mocked(api.getTypes).mockResolvedValue(
      createTypesResponse(mockTypes, {
        total: mockTypes.length,
        offset: 0,
        limit: 1000,
        hasMore: false,
      }),
    );

    const mockSpaces: Space[] = [createSpace({ id: "space1", name: "Space 1" })];
    const result = await fetchTypesKeysForTasks(mockSpaces);
    expect(result).toEqual(["task", "todo"]);
  });

  it("should return empty array when no Action types exist", async () => {
    const mockTypes: Type[] = [
      createType({ key: "page", layout: ObjectLayout.Basic }),
      createType({ key: "note", layout: ObjectLayout.Note }),
    ];

    vi.mocked(api.getTypes).mockResolvedValue(
      createTypesResponse(mockTypes, {
        total: mockTypes.length,
        offset: 0,
        limit: 1000,
        hasMore: false,
      }),
    );

    const mockSpaces: Space[] = [createSpace({ id: "space1", name: "Space 1" })];
    const result = await fetchTypesKeysForTasks(mockSpaces);
    expect(result).toEqual([]);
  });
});

describe("fetchTypeKeysForLists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return only Set and Collection layout types", async () => {
    const mockTypes: Type[] = [
      createType({ key: "kanban", layout: ObjectLayout.Set }),
      createType({ key: "gallery", layout: ObjectLayout.Collection }),
      createType({ key: "list", layout: ObjectLayout.Set }),
      createType({ key: "page", layout: ObjectLayout.Basic }),
    ];

    vi.mocked(api.getTypes).mockResolvedValue(
      createTypesResponse(mockTypes, {
        total: mockTypes.length,
        offset: 0,
        limit: 1000,
        hasMore: false,
      }),
    );

    const mockSpaces: Space[] = [createSpace({ id: "space1", name: "Space 1" })];
    const result = await fetchTypeKeysForLists(mockSpaces);
    expect(result).toEqual(expect.arrayContaining(["kanban", "gallery", "list"]));
    expect(result).toHaveLength(3);
  });

  it("should return empty array when no Set/Collection types exist", async () => {
    const mockTypes: Type[] = [
      createType({ key: "page", layout: ObjectLayout.Basic }),
      createType({ key: "task", layout: ObjectLayout.Action }),
    ];

    vi.mocked(api.getTypes).mockResolvedValue(
      createTypesResponse(mockTypes, {
        total: mockTypes.length,
        offset: 0,
        limit: 1000,
        hasMore: false,
      }),
    );

    const mockSpaces: Space[] = [createSpace({ id: "space1", name: "Space 1" })];
    const result = await fetchTypeKeysForLists(mockSpaces);
    expect(result).toEqual([]);
  });
});

describe("fetchAllTypesForSpace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch all types with pagination", async () => {
    const firstBatch: Type[] = [
      createType({ key: "type1", layout: ObjectLayout.Basic }),
      createType({ key: "type2", layout: ObjectLayout.Note }),
    ];
    const secondBatch: Type[] = [createType({ key: "type3", layout: ObjectLayout.Action })];

    vi.mocked(api.getTypes)
      .mockResolvedValueOnce(
        createTypesResponse(firstBatch, {
          total: 3,
          offset: 0,
          limit: 1000,
          hasMore: true,
        }),
      )
      .mockResolvedValueOnce(
        createTypesResponse(secondBatch, {
          total: 3,
          offset: 2,
          limit: 1000,
          hasMore: false,
        }),
      );

    const result = await fetchAllTypesForSpace("space1");
    expect(result).toHaveLength(3);
    expect(result.map((t) => t.key)).toEqual(["type1", "type2", "type3"]);
  });

  it("should handle API errors", async () => {
    vi.mocked(api.getTypes).mockRejectedValue(new Error("API Error"));

    await expect(fetchAllTypesForSpace("space1")).rejects.toThrow("API Error");
  });
});

describe("getAllTypesFromSpaces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch types from all spaces", async () => {
    const space1Types: Type[] = [
      createType({ key: "type1", layout: ObjectLayout.Basic }),
      createType({ key: "type2", layout: ObjectLayout.Note }),
    ];
    const space2Types: Type[] = [createType({ key: "type3", layout: ObjectLayout.Action })];

    vi.mocked(api.getTypes)
      .mockResolvedValueOnce(
        createTypesResponse(space1Types, {
          total: 2,
          offset: 0,
          limit: 1000,
          hasMore: false,
        }),
      )
      .mockResolvedValueOnce(
        createTypesResponse(space2Types, {
          total: 1,
          offset: 0,
          limit: 1000,
          hasMore: false,
        }),
      );

    const mockSpaces: Space[] = [
      createSpace({ id: "space1", name: "Space 1" }),
      createSpace({ id: "space2", name: "Space 2" }),
    ];

    const result = await getAllTypesFromSpaces(mockSpaces);
    expect(result).toHaveLength(3);
    expect(result.map((t) => t.key)).toEqual(expect.arrayContaining(["type1", "type2", "type3"]));
  });

  it("should include duplicates across spaces", async () => {
    const commonType = createType({ id: TEST_IDS.type, key: "common", layout: ObjectLayout.Basic });

    vi.mocked(api.getTypes)
      .mockResolvedValueOnce(
        createTypesResponse([commonType], {
          total: 1,
          offset: 0,
          limit: 1000,
          hasMore: false,
        }),
      )
      .mockResolvedValueOnce(
        createTypesResponse([commonType], {
          total: 1,
          offset: 0,
          limit: 1000,
          hasMore: false,
        }),
      );

    const mockSpaces: Space[] = [
      createSpace({ id: "space1", name: "Space 1" }),
      createSpace({ id: "space2", name: "Space 2" }),
    ];

    const result = await getAllTypesFromSpaces(mockSpaces);
    expect(result).toHaveLength(2); // Should include duplicates
    expect(result[0].key).toBe("common");
    expect(result[1].key).toBe("common");
  });
});
