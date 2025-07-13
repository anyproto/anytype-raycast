import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../api";
import { ObjectLayout, Space, Type } from "../models";
import {
  fetchAllTypesForSpace,
  fetchTypeKeysForLists,
  fetchTypeKeysForPages,
  fetchTypesKeysForTasks,
  getAllTypesFromSpaces,
} from "./type";

// Mock the API module
vi.mock("../api", () => ({
  getTypes: vi.fn(),
  getTemplates: vi.fn(),
}));

// Mock bundledTypeKeys
vi.mock("./constant", () => ({
  apiLimitMax: 1000,
  bundledTypeKeys: {
    audio: "ot-audio",
    chat: "ot-chat",
    file: "ot-file",
    image: "ot-image",
    object_type: "ot-objectType",
    tag: "ot-tag",
    template: "ot-template",
    video: "ot-video",
    set: "ot-set",
    collection: "ot-collection",
    bookmark: "ot-bookmark",
    participant: "ot-participant",
  },
}));

describe("fetchTypeKeysForPages", () => {
  const mockSpaces: Space[] = [{ id: "space1", name: "Space 1" } as Space, { id: "space2", name: "Space 2" } as Space];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty array when no types exist", async () => {
    vi.mocked(api.getTypes).mockResolvedValue({
      types: [],
      pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
    });

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual([]);
  });

  it("should exclude bundled type keys", async () => {
    const mockTypes: Type[] = [
      { key: "ot-page", layout: ObjectLayout.Basic } as Type,
      { key: "ot-note", layout: ObjectLayout.Note } as Type,
      { key: "ot-audio", layout: ObjectLayout.Basic } as Type, // Should be excluded
      { key: "ot-tag", layout: ObjectLayout.Basic } as Type, // Should be excluded
    ];

    vi.mocked(api.getTypes).mockResolvedValue({
      types: mockTypes,
      pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
    });

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual(["ot-page", "ot-note"]);
    expect(result).not.toContain("ot-audio");
    expect(result).not.toContain("ot-tag");
  });

  it("should exclude task type keys", async () => {
    const mockTypes: Type[] = [
      { key: "ot-page", layout: ObjectLayout.Basic } as Type,
      { key: "ot-task", layout: ObjectLayout.Action } as Type,
      { key: "ot-custom-task", layout: ObjectLayout.Action } as Type,
    ];

    vi.mocked(api.getTypes).mockResolvedValue({
      types: mockTypes,
      pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
    });

    const taskKeys = ["ot-task", "ot-custom-task"];
    const result = await fetchTypeKeysForPages(mockSpaces, taskKeys, []);
    expect(result).toEqual(["ot-page"]);
  });

  it("should exclude list type keys", async () => {
    const mockTypes: Type[] = [
      { key: "ot-page", layout: ObjectLayout.Basic } as Type,
      { key: "ot-kanban", layout: ObjectLayout.Set } as Type,
      { key: "ot-gallery", layout: ObjectLayout.Collection } as Type,
    ];

    vi.mocked(api.getTypes).mockResolvedValue({
      types: mockTypes,
      pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
    });

    const listKeys = ["ot-kanban", "ot-gallery"];
    const result = await fetchTypeKeysForPages(mockSpaces, [], listKeys);
    expect(result).toEqual(["ot-page"]);
  });

  it("should return unique type keys", async () => {
    const mockTypes: Type[] = [
      { key: "ot-page", layout: ObjectLayout.Basic } as Type,
      { key: "ot-page", layout: ObjectLayout.Basic } as Type, // Duplicate
      { key: "ot-note", layout: ObjectLayout.Note } as Type,
      { key: "ot-note", layout: ObjectLayout.Note } as Type, // Duplicate
    ];

    vi.mocked(api.getTypes)
      .mockResolvedValueOnce({
        types: mockTypes.slice(0, 2),
        pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
      })
      .mockResolvedValueOnce({
        types: mockTypes.slice(2),
        pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
      });

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual(["ot-page", "ot-note"]);
  });

  it("should handle multiple spaces", async () => {
    const space1Types: Type[] = [
      { key: "ot-page", layout: ObjectLayout.Basic } as Type,
      { key: "ot-note", layout: ObjectLayout.Note } as Type,
    ];
    const space2Types: Type[] = [
      { key: "ot-blog", layout: ObjectLayout.Basic } as Type,
      { key: "ot-article", layout: ObjectLayout.Basic } as Type,
    ];

    vi.mocked(api.getTypes)
      .mockResolvedValueOnce({
        types: space1Types,
        pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
      })
      .mockResolvedValueOnce({
        types: space2Types,
        pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
      });

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual(expect.arrayContaining(["ot-page", "ot-note", "ot-blog", "ot-article"]));
    expect(result).toHaveLength(4);
  });

  it("should handle pagination", async () => {
    const firstBatch: Type[] = [{ key: "ot-page1", layout: ObjectLayout.Basic } as Type];
    const secondBatch: Type[] = [{ key: "ot-page2", layout: ObjectLayout.Basic } as Type];

    vi.mocked(api.getTypes)
      .mockResolvedValueOnce({
        types: firstBatch,
        pagination: { total: 2, offset: 0, limit: 1000, has_more: true },
      })
      .mockResolvedValueOnce({
        types: secondBatch,
        pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
      });

    const result = await fetchTypeKeysForPages([mockSpaces[0]], [], []);
    expect(result).toEqual(expect.arrayContaining(["ot-page1", "ot-page2"]));
    expect(result).toHaveLength(2);
  });

  it("should handle errors gracefully", async () => {
    vi.mocked(api.getTypes)
      .mockResolvedValueOnce({
        types: [{ key: "ot-page", layout: ObjectLayout.Basic } as Type],
        pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
      })
      .mockRejectedValueOnce(new Error("API Error"));

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual(["ot-page"]); // Should still return results from successful space
  });

  it("should exclude all layout-specific types", async () => {
    const mockTypes: Type[] = [
      { key: "ot-page", layout: ObjectLayout.Basic } as Type,
      { key: "ot-set", layout: ObjectLayout.Set } as Type, // Excluded
      { key: "ot-collection", layout: ObjectLayout.Collection } as Type, // Excluded
      { key: "ot-bookmark", layout: ObjectLayout.Bookmark } as Type, // Excluded
      { key: "ot-participant", layout: ObjectLayout.Participant } as Type, // Excluded
    ];

    vi.mocked(api.getTypes).mockResolvedValue({
      types: mockTypes,
      pagination: { total: 0, offset: 0, limit: 1000, has_more: false },
    });

    const result = await fetchTypeKeysForPages(mockSpaces, [], []);
    expect(result).toEqual(["ot-page"]);
  });
});

describe("fetchTypesKeysForTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return only Action layout types", async () => {
    const mockTypes: Type[] = [
      { key: "ot-task", layout: ObjectLayout.Action } as Type,
      { key: "ot-todo", layout: ObjectLayout.Action } as Type,
      { key: "ot-page", layout: ObjectLayout.Basic } as Type,
      { key: "ot-note", layout: ObjectLayout.Note } as Type,
    ];

    vi.mocked(api.getTypes).mockResolvedValue({
      types: mockTypes,
      pagination: { total: mockTypes.length, offset: 0, limit: 1000, has_more: false },
    });

    const mockSpaces: Space[] = [{ id: "space1", name: "Space 1" } as Space];
    const result = await fetchTypesKeysForTasks(mockSpaces);
    expect(result).toEqual(["ot-task", "ot-todo"]);
  });

  it("should return empty array when no Action types exist", async () => {
    const mockTypes: Type[] = [
      { key: "ot-page", layout: ObjectLayout.Basic } as Type,
      { key: "ot-note", layout: ObjectLayout.Note } as Type,
    ];

    vi.mocked(api.getTypes).mockResolvedValue({
      types: mockTypes,
      pagination: { total: mockTypes.length, offset: 0, limit: 1000, has_more: false },
    });

    const mockSpaces: Space[] = [{ id: "space1", name: "Space 1" } as Space];
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
      { key: "ot-kanban", layout: ObjectLayout.Set } as Type,
      { key: "ot-gallery", layout: ObjectLayout.Collection } as Type,
      { key: "ot-list", layout: ObjectLayout.Set } as Type,
      { key: "ot-page", layout: ObjectLayout.Basic } as Type,
    ];

    vi.mocked(api.getTypes).mockResolvedValue({
      types: mockTypes,
      pagination: { total: mockTypes.length, offset: 0, limit: 1000, has_more: false },
    });

    const mockSpaces: Space[] = [{ id: "space1", name: "Space 1" } as Space];
    const result = await fetchTypeKeysForLists(mockSpaces);
    expect(result).toEqual(expect.arrayContaining(["ot-kanban", "ot-gallery", "ot-list"]));
    expect(result).toHaveLength(3);
  });

  it("should return empty array when no Set/Collection types exist", async () => {
    const mockTypes: Type[] = [
      { key: "ot-page", layout: ObjectLayout.Basic } as Type,
      { key: "ot-task", layout: ObjectLayout.Action } as Type,
    ];

    vi.mocked(api.getTypes).mockResolvedValue({
      types: mockTypes,
      pagination: { total: mockTypes.length, offset: 0, limit: 1000, has_more: false },
    });

    const mockSpaces: Space[] = [{ id: "space1", name: "Space 1" } as Space];
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
      { key: "type1", layout: ObjectLayout.Basic } as Type,
      { key: "type2", layout: ObjectLayout.Note } as Type,
    ];
    const secondBatch: Type[] = [{ key: "type3", layout: ObjectLayout.Action } as Type];

    vi.mocked(api.getTypes)
      .mockResolvedValueOnce({
        types: firstBatch,
        pagination: { total: 3, offset: 0, limit: 1000, has_more: true },
      })
      .mockResolvedValueOnce({
        types: secondBatch,
        pagination: { total: 3, offset: 1000, limit: 1000, has_more: false },
      });

    const result = await fetchAllTypesForSpace("space1");
    expect(result).toEqual([...firstBatch, ...secondBatch]);
    expect(api.getTypes).toHaveBeenCalledTimes(2);
  });

  it("should handle single page of results", async () => {
    const types: Type[] = [{ key: "type1", layout: ObjectLayout.Basic } as Type];

    vi.mocked(api.getTypes).mockResolvedValue({
      types,
      pagination: { total: 1, offset: 0, limit: 1000, has_more: false },
    });

    const result = await fetchAllTypesForSpace("space1");
    expect(result).toEqual(types);
    expect(api.getTypes).toHaveBeenCalledTimes(1);
  });
});

describe("getAllTypesFromSpaces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should aggregate types from multiple spaces", async () => {
    const space1Types: Type[] = [{ key: "type1" } as Type];
    const space2Types: Type[] = [{ key: "type2" } as Type];

    vi.mocked(api.getTypes)
      .mockResolvedValueOnce({
        types: space1Types,
        pagination: { total: 1, offset: 0, limit: 1000, has_more: false },
      })
      .mockResolvedValueOnce({
        types: space2Types,
        pagination: { total: 1, offset: 0, limit: 1000, has_more: false },
      });

    const mockSpaces: Space[] = [
      { id: "space1", name: "Space 1" } as Space,
      { id: "space2", name: "Space 2" } as Space,
    ];

    const result = await getAllTypesFromSpaces(mockSpaces);
    expect(result).toEqual([...space1Types, ...space2Types]);
  });

  it("should handle errors in individual spaces gracefully", async () => {
    const types: Type[] = [{ key: "type1" } as Type];

    vi.mocked(api.getTypes)
      .mockResolvedValueOnce({
        types,
        pagination: { total: 1, offset: 0, limit: 1000, has_more: false },
      })
      .mockRejectedValueOnce(new Error("API Error"));

    const mockSpaces: Space[] = [
      { id: "space1", name: "Space 1" } as Space,
      { id: "space2", name: "Space 2" } as Space,
    ];

    const result = await getAllTypesFromSpaces(mockSpaces);
    expect(result).toEqual(types); // Should still return types from successful space
  });
});
