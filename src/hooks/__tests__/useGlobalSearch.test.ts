import { getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { globalSearch } from "../../api";
import { SortDirection, SpaceObject } from "../../models";
import {
  createPaginatedResponse,
  createSpaceObject,
  mockCachedPromiseError,
  mockCachedPromiseLoading,
  mockCachedPromisePaginated,
} from "../../test";
import { apiLimit } from "../../utils";
import { useGlobalSearch } from "../useGlobalSearch";

vi.mock("../../api", () => ({
  globalSearch: vi.fn(),
}));

vi.mock("../../utils", () => ({
  apiLimit: 20,
}));

describe("useGlobalSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: "name" });
  });

  it("should return filtered objects data when loading is successful", () => {
    const mockObjects = [
      createSpaceObject({ id: "1", name: "Object 1" }),
      createSpaceObject({ id: "2", name: "Object 2" }),
      null,
      undefined,
    ];

    const mockReturn = mockCachedPromisePaginated(mockObjects, 0, true);
    vi.mocked(useCachedPromise).mockReturnValue(mockReturn as ReturnType<typeof useCachedPromise>);

    const { result } = renderHook(() => useGlobalSearch("test query", ["type1", "type2"]));

    expect(result.current.objects).toHaveLength(2);
    expect(result.current.objects[0]).toMatchObject({ id: "1", name: "Object 1" });
    expect(result.current.objects[1]).toMatchObject({ id: "2", name: "Object 2" });
    expect(result.current.objectsError).toBeUndefined();
    expect(result.current.isLoadingObjects).toBe(false);
    expect(result.current.mutateObjects).toBe(mockReturn.mutate);
    expect(result.current.objectsPagination).toBe(mockReturn.pagination);
  });

  it("should call useCachedPromise with correct parameters", () => {
    const mockReturn = mockCachedPromisePaginated([], 0, false);
    vi.mocked(useCachedPromise).mockReturnValue(mockReturn as ReturnType<typeof useCachedPromise>);

    renderHook(() => useGlobalSearch("test query", ["type1", "type2"]));

    expect(useCachedPromise).toHaveBeenCalledWith(expect.any(Function), ["test query", ["type1", "type2"], true], {
      keepPreviousData: true,
    });
  });

  it("should handle execute config option being false", () => {
    const mockReturn = mockCachedPromisePaginated([], 0, false);
    vi.mocked(useCachedPromise).mockReturnValue(mockReturn as ReturnType<typeof useCachedPromise>);

    renderHook(() => useGlobalSearch("test query", ["type1"], { execute: false }));

    expect(useCachedPromise).toHaveBeenCalledWith(expect.any(Function), ["test query", ["type1"], false], {
      keepPreviousData: true,
    });
  });

  it("should return empty data when execute is false in promise function", async () => {
    type PromiseFunction = (
      query: string,
      types: string[],
      shouldExecute: boolean,
    ) => (options: { page: number }) => Promise<{ data: unknown[]; hasMore: boolean }>;
    let cachedPromiseFunction: PromiseFunction;
    vi.mocked(useCachedPromise).mockImplementation((fn) => {
      cachedPromiseFunction = fn as unknown as PromiseFunction;
      return mockCachedPromisePaginated([], 0, false) as ReturnType<typeof useCachedPromise>;
    });

    renderHook(() => useGlobalSearch("test query", ["type1"], { execute: false }));

    const result = await cachedPromiseFunction!("test query", ["type1"], false)({ page: 0 });

    expect(result).toEqual({
      data: [],
      hasMore: false,
    });
    expect(globalSearch).not.toHaveBeenCalled();
  });

  it("should call globalSearch with correct parameters and handle pagination", async () => {
    const mockResponse = createPaginatedResponse([createSpaceObject({ id: "1", name: "Object 1" })], {
      total: 100,
      hasMore: true,
    });

    vi.mocked(globalSearch).mockResolvedValue(mockResponse);
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: "created_date" });

    type PromiseFunction = (
      query: string,
      types: string[],
      shouldExecute: boolean,
    ) => (options: { page: number }) => Promise<{ data: unknown[]; hasMore: boolean }>;
    let cachedPromiseFunction: PromiseFunction;
    vi.mocked(useCachedPromise).mockImplementation((fn) => {
      cachedPromiseFunction = fn as unknown as PromiseFunction;
      return mockCachedPromisePaginated([], 0, false) as ReturnType<typeof useCachedPromise>;
    });

    renderHook(() => useGlobalSearch("test query", ["type1", "type2"]));

    const result = await cachedPromiseFunction!("test query", ["type1", "type2"], true)({ page: 2 });

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

  it("should use ascending sort for name property", async () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: "name" });
    vi.mocked(globalSearch).mockResolvedValue(createPaginatedResponse([]));

    type PromiseFunction = (
      query: string,
      types: string[],
      shouldExecute: boolean,
    ) => (options: { page: number }) => Promise<{ data: unknown[]; hasMore: boolean }>;
    let cachedPromiseFunction: PromiseFunction;
    vi.mocked(useCachedPromise).mockImplementation((fn) => {
      cachedPromiseFunction = fn as unknown as PromiseFunction;
      return mockCachedPromisePaginated([], 0, false) as ReturnType<typeof useCachedPromise>;
    });

    renderHook(() => useGlobalSearch("test", ["type1"]));

    await cachedPromiseFunction!("test", ["type1"], true)({ page: 0 });

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
    vi.mocked(useCachedPromise).mockReturnValue(mockCachedPromiseLoading() as ReturnType<typeof useCachedPromise>);

    const { result } = renderHook(() => useGlobalSearch("test", ["type1"]));

    expect(result.current.objects).toEqual([]);
    expect(result.current.objectsError).toBeUndefined();
    expect(result.current.isLoadingObjects).toBe(true);
  });

  it("should handle error state", () => {
    const mockError = new Error("Search failed");
    vi.mocked(useCachedPromise).mockReturnValue(
      mockCachedPromiseError(mockError) as ReturnType<typeof useCachedPromise>,
    );

    const { result } = renderHook(() => useGlobalSearch("test", ["type1"]));

    expect(result.current.objects).toEqual([]);
    expect(result.current.objectsError).toBe(mockError);
    expect(result.current.isLoadingObjects).toBe(false);
  });

  it("should handle empty data", () => {
    const mockReturn = mockCachedPromisePaginated(undefined, 0, false);
    vi.mocked(useCachedPromise).mockReturnValue(mockReturn as ReturnType<typeof useCachedPromise>);

    const { result } = renderHook(() => useGlobalSearch("", []));

    expect(result.current.objects).toEqual([]);
  });

  it("should filter out falsy values from data", () => {
    const mockObjects = [
      createSpaceObject({ id: "1", name: "Valid Object" }),
      null,
      undefined,
      false,
      "",
      0,
      createSpaceObject({ id: "2", name: "Another Valid Object" }),
    ] as (SpaceObject | null | undefined | false | "" | 0)[];

    const mockReturn = mockCachedPromisePaginated(mockObjects, 0, false);
    vi.mocked(useCachedPromise).mockReturnValue(mockReturn as ReturnType<typeof useCachedPromise>);

    const { result } = renderHook(() => useGlobalSearch("test", ["type1"]));

    expect(result.current.objects).toHaveLength(2);
    expect(result.current.objects[0]).toMatchObject({ id: "1", name: "Valid Object" });
    expect(result.current.objects[1]).toMatchObject({ id: "2", name: "Another Valid Object" });
  });

  it.each([
    { preference: "name", expectedDirection: SortDirection.Ascending },
    { preference: "created_date", expectedDirection: SortDirection.Descending },
    { preference: "last_modified_date", expectedDirection: SortDirection.Descending },
    { preference: "last_opened_date", expectedDirection: SortDirection.Descending },
  ])("should use correct sort direction for $preference", async ({ preference, expectedDirection }) => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: preference });
    vi.mocked(globalSearch).mockResolvedValue(createPaginatedResponse([]));

    type PromiseFunction = (
      query: string,
      types: string[],
      shouldExecute: boolean,
    ) => (options: { page: number }) => Promise<{ data: unknown[]; hasMore: boolean }>;
    let cachedPromiseFunction: PromiseFunction;
    vi.mocked(useCachedPromise).mockImplementation((fn) => {
      cachedPromiseFunction = fn as unknown as PromiseFunction;
      return mockCachedPromisePaginated([], 0, false) as ReturnType<typeof useCachedPromise>;
    });

    renderHook(() => useGlobalSearch("test", ["type1"]));

    await cachedPromiseFunction!("test", ["type1"], true)({ page: 0 });

    expect(globalSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: {
          property_key: preference,
          direction: expectedDirection,
        },
      }),
      expect.any(Object),
    );
  });
});
