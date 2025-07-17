import { useCachedPromise } from "@raycast/utils";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getObject } from "../../api";
import { SpaceObject } from "../../models";
import {
  API_ERRORS,
  createApiError,
  createSpaceObject,
  createSpaceObjectWithBody,
  mockCachedPromiseError,
  mockCachedPromiseLoading,
  mockCachedPromiseSuccess,
  TEST_IDS,
} from "../../test";
import { errorConnectionMessage, getPinned, removePinned } from "../../utils";
import { usePinnedObjects } from "../usePinnedObjects";

// Mock dependencies
vi.mock("../../api", () => ({
  getObject: vi.fn(),
}));

vi.mock("../../utils", () => ({
  getPinned: vi.fn(),
  removePinned: vi.fn(),
  errorConnectionMessage: "Connection error",
  ErrorWithStatus: class ErrorWithStatus extends Error {
    status?: number;
    constructor(message: string, status?: number) {
      super(message);
      this.status = status;
    }
  },
}));

describe("usePinnedObjects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return pinned objects when loading is successful", () => {
    const mockObjects = [
      createSpaceObject({ id: "obj1", name: "Object 1" }),
      createSpaceObject({ id: "obj2", name: "Object 2" }),
    ];

    const mockReturn = mockCachedPromiseSuccess(mockObjects);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useCachedPromise).mockReturnValue(mockReturn as any);

    const { result } = renderHook(() => usePinnedObjects("test-key"));

    expect(result.current.pinnedObjects).toEqual(mockObjects);
    expect(result.current.pinnedObjectsError).toBeUndefined();
    expect(result.current.isLoadingPinnedObjects).toBe(false);
    expect(result.current.mutatePinnedObjects).toBe(mockReturn.mutate);
  });

  it("should call useCachedPromise with correct parameters", () => {
    const mockReturn = mockCachedPromiseSuccess([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useCachedPromise).mockReturnValue(mockReturn as any);

    renderHook(() => usePinnedObjects("test-key"));

    expect(useCachedPromise).toHaveBeenCalledWith(expect.any(Function), ["test-key"], { keepPreviousData: true });
  });

  it("should fetch pinned objects and filter out archived ones", async () => {
    const mockPinnedData = [
      { spaceId: TEST_IDS.space, objectId: "obj1" },
      { spaceId: TEST_IDS.space, objectId: "obj2" },
      { spaceId: TEST_IDS.space, objectId: "obj3" },
    ];

    const mockObject1 = createSpaceObject({ id: "obj1", archived: false });
    const mockObject2 = createSpaceObject({ id: "obj2", archived: true });
    const mockObject3 = createSpaceObject({ id: "obj3", archived: false });

    vi.mocked(getPinned).mockResolvedValue(mockPinnedData);
    vi.mocked(getObject)
      .mockResolvedValueOnce({ object: createSpaceObjectWithBody({ ...mockObject1 }) })
      .mockResolvedValueOnce({ object: createSpaceObjectWithBody({ ...mockObject2 }) })
      .mockResolvedValueOnce({ object: createSpaceObjectWithBody({ ...mockObject3 }) });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cachedPromiseFunction: any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return mockCachedPromiseSuccess([]) as any;
    });

    renderHook(() => usePinnedObjects("test-key"));

    const result = await cachedPromiseFunction("test-key");

    expect(getPinned).toHaveBeenCalledWith("test-key");
    expect(getObject).toHaveBeenCalledTimes(3);
    expect(removePinned).toHaveBeenCalledWith(TEST_IDS.space, "obj2", "test-key");
    expect(result).toEqual([mockObject1, mockObject3]);
  });

  it("should handle 404 errors by removing pinned objects", async () => {
    const mockPinnedData = [
      { spaceId: TEST_IDS.space, objectId: "obj1" },
      { spaceId: TEST_IDS.space, objectId: "obj2" },
    ];

    const mockObject1 = createSpaceObject({ id: "obj1" });
    const error404 = createApiError(API_ERRORS.NOT_FOUND, 404);

    vi.mocked(getPinned).mockResolvedValue(mockPinnedData);
    vi.mocked(getObject)
      .mockResolvedValueOnce({ object: createSpaceObjectWithBody({ ...mockObject1 }) })
      .mockRejectedValueOnce(error404);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cachedPromiseFunction: any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return mockCachedPromiseSuccess([]) as any;
    });

    renderHook(() => usePinnedObjects("test-key"));

    const result = await cachedPromiseFunction("test-key");

    expect(removePinned).toHaveBeenCalledWith(TEST_IDS.space, "obj2", "test-key");
    expect(result).toEqual([mockObject1]);
  });

  it("should handle 410 errors by removing pinned objects", async () => {
    const mockPinnedData = [
      { spaceId: TEST_IDS.space, objectId: "obj1" },
      { spaceId: TEST_IDS.space, objectId: "obj2" },
    ];

    const mockObject1 = createSpaceObject({ id: "obj1" });
    const error410 = createApiError("Gone", 410);

    vi.mocked(getPinned).mockResolvedValue(mockPinnedData);
    vi.mocked(getObject)
      .mockResolvedValueOnce({ object: createSpaceObjectWithBody({ ...mockObject1 }) })
      .mockRejectedValueOnce(error410);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cachedPromiseFunction: any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return mockCachedPromiseSuccess([]) as any;
    });

    renderHook(() => usePinnedObjects("test-key"));

    const result = await cachedPromiseFunction("test-key");

    expect(removePinned).toHaveBeenCalledWith(TEST_IDS.space, "obj2", "test-key");
    expect(result).toEqual([mockObject1]);
  });

  it("should not remove objects on connection errors", async () => {
    const mockPinnedData = [
      { spaceId: TEST_IDS.space, objectId: "obj1" },
      { spaceId: TEST_IDS.space, objectId: "obj2" },
    ];

    const mockObject1 = createSpaceObject({ id: "obj1" });
    const connectionError = new Error(errorConnectionMessage);

    vi.mocked(getPinned).mockResolvedValue(mockPinnedData);
    vi.mocked(getObject)
      .mockResolvedValueOnce({ object: createSpaceObjectWithBody({ ...mockObject1 }) })
      .mockRejectedValueOnce(connectionError);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cachedPromiseFunction: any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return mockCachedPromiseSuccess([]) as any;
    });

    renderHook(() => usePinnedObjects("test-key"));

    await expect(cachedPromiseFunction("test-key")).rejects.toThrow(errorConnectionMessage);
    expect(removePinned).not.toHaveBeenCalled();
  });

  it("should not remove objects on other errors", async () => {
    const mockPinnedData = [
      { spaceId: TEST_IDS.space, objectId: "obj1" },
      { spaceId: TEST_IDS.space, objectId: "obj2" },
    ];

    const mockObject1 = createSpaceObject({ id: "obj1" });
    const genericError = new Error("Some other error");

    vi.mocked(getPinned).mockResolvedValue(mockPinnedData);
    vi.mocked(getObject)
      .mockResolvedValueOnce({ object: createSpaceObjectWithBody({ ...mockObject1 }) })
      .mockRejectedValueOnce(genericError);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cachedPromiseFunction: any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return mockCachedPromiseSuccess([]) as any;
    });

    renderHook(() => usePinnedObjects("test-key"));

    const result = await cachedPromiseFunction("test-key");

    expect(removePinned).not.toHaveBeenCalled();
    expect(result).toEqual([mockObject1]);
  });

  it("should handle empty pinned objects", async () => {
    vi.mocked(getPinned).mockResolvedValue([]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cachedPromiseFunction: any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return mockCachedPromiseSuccess([]) as any;
    });

    renderHook(() => usePinnedObjects("test-key"));

    const result = await cachedPromiseFunction("test-key");

    expect(getObject).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("should handle mixed success and failure", async () => {
    const mockPinnedData = [
      { spaceId: TEST_IDS.space, objectId: "obj1" },
      { spaceId: TEST_IDS.space, objectId: "obj2" },
      { spaceId: TEST_IDS.space, objectId: "obj3" },
    ];

    const mockObject1 = createSpaceObject({ id: "obj1" });
    const mockObject3 = createSpaceObject({ id: "obj3" });
    const error404 = createApiError(API_ERRORS.NOT_FOUND, 404);

    vi.mocked(getPinned).mockResolvedValue(mockPinnedData);
    vi.mocked(getObject)
      .mockResolvedValueOnce({ object: createSpaceObjectWithBody({ ...mockObject1 }) })
      .mockRejectedValueOnce(error404)
      .mockResolvedValueOnce({ object: createSpaceObjectWithBody({ ...mockObject3 }) });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cachedPromiseFunction: any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return mockCachedPromiseSuccess([]) as any;
    });

    renderHook(() => usePinnedObjects("test-key"));

    const result = await cachedPromiseFunction("test-key");

    expect(removePinned).toHaveBeenCalledWith(TEST_IDS.space, "obj2", "test-key");
    expect(result).toEqual([mockObject1, mockObject3]);
  });

  it("should handle loading state", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useCachedPromise).mockReturnValue(mockCachedPromiseLoading() as any);

    const { result } = renderHook(() => usePinnedObjects("test-key"));

    expect(result.current.pinnedObjects).toBeUndefined();
    expect(result.current.pinnedObjectsError).toBeUndefined();
    expect(result.current.isLoadingPinnedObjects).toBe(true);
  });

  it("should handle error state", () => {
    const mockError = new Error("Failed to load pinned objects");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useCachedPromise).mockReturnValue(mockCachedPromiseError(mockError) as any);

    const { result } = renderHook(() => usePinnedObjects("test-key"));

    expect(result.current.pinnedObjects).toBeUndefined();
    expect(result.current.pinnedObjectsError).toBe(mockError);
    expect(result.current.isLoadingPinnedObjects).toBe(false);
  });

  it("should properly type the returned objects", () => {
    const mockData = [createSpaceObject({ id: "obj1" })];
    const mockReturn = mockCachedPromiseSuccess(mockData);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useCachedPromise).mockReturnValue(mockReturn as any);

    const { result } = renderHook(() => usePinnedObjects("test-key"));

    // Check that the type is correct
    const objects: SpaceObject[] = result.current.pinnedObjects;
    expect(objects).toEqual(mockData);
  });
});
