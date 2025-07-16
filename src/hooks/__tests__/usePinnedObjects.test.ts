import { useCachedPromise } from "@raycast/utils";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getObject } from "../../api";
import { BodyFormat, SpaceObject, SpaceObjectWithBody } from "../../models";
import { errorConnectionMessage, ErrorWithStatus, getPinned, removePinned } from "../../utils";
import { usePinnedObjects } from "../usePinnedObjects";

// Mock dependencies
vi.mock("../../api", () => ({
  getObject: vi.fn(),
}));

vi.mock("../../utils", () => ({
  getPinned: vi.fn(),
  removePinned: vi.fn(),
  errorConnectionMessage: "Connection error",
}));

vi.mock("@raycast/utils", () => ({
  useCachedPromise: vi.fn(),
}));

// Helper to create a mock SpaceObjectWithBody
const createMockSpaceObject = (partial: Partial<SpaceObject>): SpaceObjectWithBody => ({
  object: "object",
  id: partial.id || "obj1",
  name: partial.name || "Test Object",
  icon: "icon",
  space_id: "space1",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layout: "basic" as any,
  snippet: "snippet",
  archived: partial.archived ?? false,
  type: {
    object: "type",
    id: "type1",
    key: "document",
    name: "Document",
    plural_name: "Documents",
    icon: "icon",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    layout: "basic" as any,
    archived: false,
    properties: [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  properties: [],
  markdown: "",
});

// Helper to create properly typed mock returns
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockUseCachedPromiseReturn = (overrides: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  isLoading?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutate?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): any => {
  if (overrides.isLoading) {
    return {
      isLoading: true as const,
      error: undefined,
      data: undefined,
    };
  }
  if (overrides.error) {
    return {
      isLoading: false as const,
      error: overrides.error,
      data: undefined,
    };
  }
  return {
    isLoading: false as const,
    error: undefined,
    data: overrides.data ?? [],
    mutate: overrides.mutate ?? vi.fn(),
    revalidate: vi.fn(),
  };
};

describe("usePinnedObjects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return pinned objects when loading is successful", () => {
    const mockObjects = [
      { id: "1", name: "Object 1", spaceId: "space1" },
      { id: "2", name: "Object 2", spaceId: "space1" },
    ];

    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      data: mockObjects,
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    const { result } = renderHook(() => usePinnedObjects("test-key"));

    expect(result.current.pinnedObjects).toEqual(mockObjects);
    expect(result.current.pinnedObjectsError).toBeUndefined();
    expect(result.current.isLoadingPinnedObjects).toBe(false);
    expect(result.current.mutatePinnedObjects).toBe(mockUseCachedPromiseReturn.mutate);
  });

  it("should call useCachedPromise with correct parameters", () => {
    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      data: [],
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    renderHook(() => usePinnedObjects("test-key"));

    expect(useCachedPromise).toHaveBeenCalledWith(expect.any(Function), ["test-key"], {
      keepPreviousData: true,
    });
  });

  it("should fetch pinned objects and filter out archived ones", async () => {
    const mockPinnedData = [
      { spaceId: "space1", objectId: "obj1" },
      { spaceId: "space1", objectId: "obj2" },
      { spaceId: "space1", objectId: "obj3" },
    ];

    const mockObjects = {
      obj1: createMockSpaceObject({ id: "obj1", name: "Object 1", archived: false }),
      obj2: createMockSpaceObject({ id: "obj2", name: "Object 2", archived: true }), // Archived
      obj3: createMockSpaceObject({ id: "obj3", name: "Object 3", archived: false }),
    };

    vi.mocked(getPinned).mockResolvedValue(mockPinnedData);
    vi.mocked(getObject).mockImplementation((_spaceId, objectId) => {
      return Promise.resolve({ object: mockObjects[objectId as keyof typeof mockObjects] });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cachedPromiseFunction: any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      return createMockUseCachedPromiseReturn({
        data: [],
      });
    });

    renderHook(() => usePinnedObjects("test-key"));

    const result = await cachedPromiseFunction("test-key");

    expect(getPinned).toHaveBeenCalledWith("test-key");
    expect(getObject).toHaveBeenCalledTimes(3);
    expect(getObject).toHaveBeenCalledWith("space1", "obj1", BodyFormat.Markdown);
    expect(getObject).toHaveBeenCalledWith("space1", "obj2", BodyFormat.Markdown);
    expect(getObject).toHaveBeenCalledWith("space1", "obj3", BodyFormat.Markdown);

    // Should remove archived object
    expect(removePinned).toHaveBeenCalledWith("space1", "obj2", "test-key");

    // Should only return non-archived objects
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("obj1");
    expect(result[0].name).toBe("Object 1");
    expect(result[0].archived).toBe(false);
    expect(result[1].id).toBe("obj3");
    expect(result[1].name).toBe("Object 3");
    expect(result[1].archived).toBe(false);
  });

  it("should handle 404 errors and remove non-existent objects", async () => {
    const mockPinnedData = [
      { spaceId: "space1", objectId: "obj1" },
      { spaceId: "space1", objectId: "obj2" },
    ];

    vi.mocked(getPinned).mockResolvedValue(mockPinnedData);
    vi.mocked(getObject)
      .mockResolvedValueOnce({ object: createMockSpaceObject({ id: "obj1", name: "Object 1", archived: false }) })
      .mockRejectedValueOnce({ status: 404, message: "Not found" } as ErrorWithStatus);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cachedPromiseFunction: any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      return createMockUseCachedPromiseReturn({
        data: [],
      });
    });

    renderHook(() => usePinnedObjects("test-key"));

    const result = await cachedPromiseFunction("test-key");

    expect(removePinned).toHaveBeenCalledWith("space1", "obj2", "test-key");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("obj1");
    expect(result[0].name).toBe("Object 1");
    expect(result[0].archived).toBe(false);
  });

  it("should handle 410 errors and remove gone objects", async () => {
    const mockPinnedData = [
      { spaceId: "space1", objectId: "obj1" },
      { spaceId: "space1", objectId: "obj2" },
    ];

    vi.mocked(getPinned).mockResolvedValue(mockPinnedData);
    vi.mocked(getObject)
      .mockResolvedValueOnce({ object: createMockSpaceObject({ id: "obj1", name: "Object 1", archived: false }) })
      .mockRejectedValueOnce({ status: 410, message: "Gone" } as ErrorWithStatus);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cachedPromiseFunction: any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      return createMockUseCachedPromiseReturn({
        data: [],
      });
    });

    renderHook(() => usePinnedObjects("test-key"));

    const result = await cachedPromiseFunction("test-key");

    expect(removePinned).toHaveBeenCalledWith("space1", "obj2", "test-key");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("obj1");
    expect(result[0].name).toBe("Object 1");
    expect(result[0].archived).toBe(false);
  });

  it("should throw connection errors", async () => {
    const mockPinnedData = [{ spaceId: "space1", objectId: "obj1" }];
    const connectionError = { message: errorConnectionMessage, status: 500 } as ErrorWithStatus;

    vi.mocked(getPinned).mockResolvedValue(mockPinnedData);
    vi.mocked(getObject).mockRejectedValue(connectionError);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cachedPromiseFunction: any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      return createMockUseCachedPromiseReturn({
        data: [],
      });
    });

    renderHook(() => usePinnedObjects("test-key"));

    await expect(cachedPromiseFunction("test-key")).rejects.toEqual(connectionError);
    expect(removePinned).not.toHaveBeenCalled();
  });

  it("should handle other errors without removing objects", async () => {
    const mockPinnedData = [
      { spaceId: "space1", objectId: "obj1" },
      { spaceId: "space1", objectId: "obj2" },
    ];

    vi.mocked(getPinned).mockResolvedValue(mockPinnedData);
    vi.mocked(getObject)
      .mockResolvedValueOnce({ object: createMockSpaceObject({ id: "obj1", name: "Object 1", archived: false }) })
      .mockRejectedValueOnce({ status: 500, message: "Server error" } as ErrorWithStatus);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cachedPromiseFunction: any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      return createMockUseCachedPromiseReturn({
        data: [],
      });
    });

    renderHook(() => usePinnedObjects("test-key"));

    const result = await cachedPromiseFunction("test-key");

    // Should not remove object for other errors
    expect(removePinned).not.toHaveBeenCalled();
    // Should still return the successful object
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("obj1");
    expect(result[0].name).toBe("Object 1");
    expect(result[0].archived).toBe(false);
  });

  it("should handle loading state", () => {
    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      isLoading: true,
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    const { result } = renderHook(() => usePinnedObjects("test-key"));

    expect(result.current.pinnedObjects).toBeUndefined();
    expect(result.current.pinnedObjectsError).toBeUndefined();
    expect(result.current.isLoadingPinnedObjects).toBe(true);
  });

  it("should handle error state", () => {
    const mockError = new Error("Failed to fetch pinned objects");
    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      error: mockError,
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    const { result } = renderHook(() => usePinnedObjects("test-key"));

    expect(result.current.pinnedObjects).toBeUndefined();
    expect(result.current.pinnedObjectsError).toBe(mockError);
    expect(result.current.isLoadingPinnedObjects).toBe(false);
  });

  it("should handle empty pinned objects", async () => {
    vi.mocked(getPinned).mockResolvedValue([]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cachedPromiseFunction: any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      return createMockUseCachedPromiseReturn({
        data: [],
      });
    });

    renderHook(() => usePinnedObjects("test-key"));

    const result = await cachedPromiseFunction("test-key");

    expect(getObject).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("should handle mixed success and failure scenarios", async () => {
    const mockPinnedData = [
      { spaceId: "space1", objectId: "obj1" },
      { spaceId: "space1", objectId: "obj2" },
      { spaceId: "space2", objectId: "obj3" },
      { spaceId: "space2", objectId: "obj4" },
    ];

    vi.mocked(getPinned).mockResolvedValue(mockPinnedData);
    vi.mocked(getObject)
      .mockResolvedValueOnce({ object: createMockSpaceObject({ id: "obj1", name: "Object 1", archived: false }) })
      .mockRejectedValueOnce({ status: 404, message: "Not found" } as ErrorWithStatus)
      .mockResolvedValueOnce({ object: createMockSpaceObject({ id: "obj3", name: "Object 3", archived: true }) })
      .mockResolvedValueOnce({ object: createMockSpaceObject({ id: "obj4", name: "Object 4", archived: false }) });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cachedPromiseFunction: any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      return createMockUseCachedPromiseReturn({
        data: [],
      });
    });

    renderHook(() => usePinnedObjects("test-key"));

    const result = await cachedPromiseFunction("test-key");

    // Should remove obj2 (404) and obj3 (archived)
    expect(removePinned).toHaveBeenCalledWith("space1", "obj2", "test-key");
    expect(removePinned).toHaveBeenCalledWith("space2", "obj3", "test-key");
    expect(removePinned).toHaveBeenCalledTimes(2);

    // Should only return valid, non-archived objects
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("obj1");
    expect(result[0].name).toBe("Object 1");
    expect(result[0].archived).toBe(false);
    expect(result[1].id).toBe("obj4");
    expect(result[1].name).toBe("Object 4");
    expect(result[1].archived).toBe(false);
  });

  it("should cast data to SpaceObject array", () => {
    const mockData = [
      { id: "1", name: "Object 1" },
      { id: "2", name: "Object 2" },
    ];

    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      data: mockData,
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    const { result } = renderHook(() => usePinnedObjects("test-key"));

    // Check that the type is correct
    const objects: SpaceObject[] = result.current.pinnedObjects;
    expect(objects).toEqual(mockData);
  });
});
