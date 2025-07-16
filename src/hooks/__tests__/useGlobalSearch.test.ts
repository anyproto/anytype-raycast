import { getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { globalSearch } from "../../api";
import { SortDirection } from "../../models";
import { apiLimit } from "../../utils";
import { useGlobalSearch } from "../useGlobalSearch";

// Mock dependencies that aren't already mocked globally
vi.mock("../../api", () => ({
  globalSearch: vi.fn(),
}));

vi.mock("../../utils", () => ({
  apiLimit: 20,
}));

// Helper to create properly typed mock returns
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockUseCachedPromiseReturn = (overrides: {
  data?: unknown;
  error?: Error;
  isLoading?: boolean;
  mutate?: () => void;
  pagination?: { hasMore: boolean };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): any => {
  const base = {
    mutate: overrides.mutate ?? vi.fn(),
    revalidate: vi.fn(),
  };

  if (overrides.isLoading) {
    return {
      ...base,
      isLoading: true as const,
      error: undefined,
      data: undefined,
    };
  }
  if (overrides.error) {
    return {
      ...base,
      isLoading: false as const,
      error: overrides.error,
      data: undefined,
    };
  }
  return {
    ...base,
    isLoading: false as const,
    error: undefined,
    data: overrides.data ?? [],
    ...(overrides.pagination && {
      pagination: {
        pageSize: 20,
        hasMore: overrides.pagination.hasMore ?? false,
        onLoadMore: vi.fn(),
      },
    }),
  };
};

describe("useGlobalSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: "name" });
  });

  it("should return filtered objects data when loading is successful", () => {
    const mockObjects = [{ id: "1", name: "Object 1" }, { id: "2", name: "Object 2" }, null, undefined];

    const mockMutate = vi.fn();
    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      data: mockObjects,
      mutate: mockMutate,
      pagination: { hasMore: true },
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    const { result } = renderHook(() => useGlobalSearch("test query", ["type1", "type2"]));

    // Should filter out null/undefined values
    expect(result.current.objects).toEqual([
      { id: "1", name: "Object 1" },
      { id: "2", name: "Object 2" },
    ]);
    expect(result.current.objectsError).toBeUndefined();
    expect(result.current.isLoadingObjects).toBe(false);
    expect(result.current.mutateObjects).toBe(mockMutate);
    expect(result.current.objectsPagination).toBe(mockUseCachedPromiseReturn.pagination);
  });

  it("should call useCachedPromise with correct parameters", () => {
    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      data: [],
      pagination: { hasMore: false },
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    renderHook(() => useGlobalSearch("test query", ["type1", "type2"]));

    expect(useCachedPromise).toHaveBeenCalledWith(expect.any(Function), ["test query", ["type1", "type2"], true], {
      keepPreviousData: true,
    });
  });

  it("should handle execute config option being false", () => {
    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      data: [],
      pagination: { hasMore: false },
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    renderHook(() => useGlobalSearch("test query", ["type1"], { execute: false }));

    expect(useCachedPromise).toHaveBeenCalledWith(expect.any(Function), ["test query", ["type1"], false], {
      keepPreviousData: true,
    });
  });

  it("should return empty data when execute is false in promise function", async () => {
    let cachedPromiseFunction: unknown;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      return createMockUseCachedPromiseReturn({
        data: [],
        pagination: { hasMore: false },
      });
    });

    renderHook(() => useGlobalSearch("test query", ["type1"], { execute: false }));

    // Execute the cached promise function with execute = false
    const fn = cachedPromiseFunction as (
      query: string,
      types: string[],
      execute: boolean,
    ) => (options: { page: number }) => Promise<{ data: unknown[]; hasMore: boolean }>;
    const result = await fn("test query", ["type1"], false)({ page: 0 });

    expect(result).toEqual({
      data: [],
      hasMore: false,
    });
    expect(globalSearch).not.toHaveBeenCalled();
  });

  it("should call globalSearch with correct parameters and handle pagination", async () => {
    const mockResponse = {
      data: [{ id: "1", name: "Object 1" }],
      pagination: { total: 1, offset: 0, limit: 20, has_more: true },
    };

    vi.mocked(globalSearch).mockResolvedValue(mockResponse as never);
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: "created_date" });

    let cachedPromiseFunction: unknown;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      return createMockUseCachedPromiseReturn({
        data: [],
        pagination: { hasMore: false },
      });
    });

    renderHook(() => useGlobalSearch("test query", ["type1", "type2"]));

    // Execute the cached promise function for page 2
    const fn = cachedPromiseFunction as (
      query: string,
      types: string[],
      execute: boolean,
    ) => (options: { page: number }) => Promise<{ data: unknown[]; hasMore: boolean }>;
    const result = await fn("test query", ["type1", "type2"], true)({ page: 2 });

    expect(globalSearch).toHaveBeenCalledWith(
      {
        query: "test query",
        types: ["type1", "type2"],
        sort: {
          property_key: "created_date",
          direction: SortDirection.Descending,
        },
      },
      {
        offset: 2 * apiLimit,
        limit: apiLimit,
      },
    );

    expect(result).toEqual({
      data: mockResponse.data,
      hasMore: true,
    });
  });

  it("should use ascending sort direction for name preference", async () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: "name" });
    vi.mocked(globalSearch).mockResolvedValue({
      data: [],
      pagination: { total: 0, offset: 0, limit: 20, has_more: false },
    });

    let cachedPromiseFunction: unknown;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      return createMockUseCachedPromiseReturn({
        data: [],
        pagination: { hasMore: false },
      });
    });

    renderHook(() => useGlobalSearch("test", ["type1"]));

    const fn = cachedPromiseFunction as (
      query: string,
      types: string[],
      execute: boolean,
    ) => (options: { page: number }) => Promise<{ data: unknown[]; hasMore: boolean }>;
    await fn("test", ["type1"], true)({ page: 0 });

    expect(globalSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: {
          property_key: "name",
          direction: SortDirection.Ascending,
        },
      }),
      expect.any(Object),
    );
  });

  it("should handle loading state", () => {
    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      isLoading: true,
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    const { result } = renderHook(() => useGlobalSearch("test", ["type1"]));

    expect(result.current.objects).toEqual([]);
    expect(result.current.objectsError).toBeUndefined();
    expect(result.current.isLoadingObjects).toBe(true);
  });

  it("should handle error state", () => {
    const mockError = new Error("Search failed");
    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      error: mockError,
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    const { result } = renderHook(() => useGlobalSearch("test", ["type1"]));

    expect(result.current.objects).toEqual([]);
    expect(result.current.objectsError).toBe(mockError);
    expect(result.current.isLoadingObjects).toBe(false);
  });

  it("should handle empty data", () => {
    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      data: undefined,
      pagination: { hasMore: false },
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    const { result } = renderHook(() => useGlobalSearch("", []));

    expect(result.current.objects).toEqual([]);
  });

  it("should filter out falsy values from data", () => {
    const mockObjects = [
      { id: "1", name: "Valid Object" },
      null,
      undefined,
      false,
      0,
      "",
      { id: "2", name: "Another Valid Object" },
    ];

    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      data: mockObjects,
      pagination: { hasMore: false },
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    const { result } = renderHook(() => useGlobalSearch("test", ["type1"]));

    // Should only include truthy objects
    expect(result.current.objects).toEqual([
      { id: "1", name: "Valid Object" },
      { id: "2", name: "Another Valid Object" },
    ]);
  });

  it("should handle different sort preferences", async () => {
    const sortConfigs = [
      { preference: "last_modified_date", expectedDirection: SortDirection.Descending },
      { preference: "last_opened_date", expectedDirection: SortDirection.Descending },
      { preference: "created_date", expectedDirection: SortDirection.Descending },
    ];

    for (const config of sortConfigs) {
      vi.clearAllMocks();
      vi.mocked(getPreferenceValues).mockReturnValue({ sort: config.preference });
      vi.mocked(globalSearch).mockResolvedValue({
        data: [],
        pagination: { total: 0, offset: 0, limit: 20, has_more: false },
      });

      let cachedPromiseFunction: unknown;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
        cachedPromiseFunction = fn;
        return createMockUseCachedPromiseReturn({
          data: [],
          pagination: { hasMore: false },
        });
      });

      renderHook(() => useGlobalSearch("test", ["type1"]));

      const fn = cachedPromiseFunction as (
        query: string,
        types: string[],
        execute: boolean,
      ) => (options: { page: number }) => Promise<{ data: unknown[]; hasMore: boolean }>;
      await fn("test", ["type1"], true)({ page: 0 });

      expect(globalSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: {
            property_key: config.preference,
            direction: config.expectedDirection,
          },
        }),
        expect.any(Object),
      );
    }
  });
});
