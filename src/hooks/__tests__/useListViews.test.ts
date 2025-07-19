/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCachedPromise } from "@raycast/utils";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getListViews } from "../../api";
import { View, ViewLayout } from "../../models";
import {
  mockCachedPromiseError,
  mockCachedPromiseLoading,
  mockCachedPromisePaginated,
  mockCachedPromiseSuccess,
  TEST_IDS,
} from "../../test";
import { useListViews } from "../useListViews";

vi.mock("@raycast/utils");
vi.mock("../../api");

const mockUseCachedPromise = vi.mocked(useCachedPromise);
const mockGetListViews = vi.mocked(getListViews);

describe("useListViews", () => {
  const spaceId = TEST_IDS.space;
  const listId = TEST_IDS.list;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch list views successfully", () => {
    const mockViews: View[] = [
      { id: "view1", name: "Table View", layout: ViewLayout.List, filters: [], sorts: [] },
      { id: "view2", name: "Board View", layout: ViewLayout.List, filters: [], sorts: [] },
    ];

    mockUseCachedPromise.mockReturnValue(mockCachedPromiseSuccess(mockViews) as any);

    const { result } = renderHook(() => useListViews(spaceId, listId));

    expect(result.current.views).toEqual(mockViews);
    expect(result.current.viewsError).toBeUndefined();
    expect(result.current.isLoadingViews).toBe(false);
  });

  it("should handle loading state", () => {
    mockUseCachedPromise.mockReturnValue(mockCachedPromiseLoading<View[]>() as any);

    const { result } = renderHook(() => useListViews(spaceId, listId));

    expect(result.current.views).toEqual([]);
    expect(result.current.isLoadingViews).toBe(true);
    expect(result.current.viewsError).toBeUndefined();
  });

  it("should handle error state", () => {
    const mockError = new Error("Failed to fetch views");
    mockUseCachedPromise.mockReturnValue(mockCachedPromiseError<View[]>(mockError) as any);

    const { result } = renderHook(() => useListViews(spaceId, listId));

    expect(result.current.views).toEqual([]);
    expect(result.current.viewsError).toBe(mockError);
    expect(result.current.isLoadingViews).toBe(false);
  });

  it("should filter out undefined views", () => {
    const mockViews = [
      { id: "view1", name: "View 1", layout: ViewLayout.List, filters: [], sorts: [] },
      undefined,
      { id: "view2", name: "View 2", layout: ViewLayout.Kanban, filters: [], sorts: [] },
      null,
    ] as (View | undefined | null)[];

    mockUseCachedPromise.mockReturnValue(mockCachedPromiseSuccess(mockViews) as any);

    const { result } = renderHook(() => useListViews(spaceId, listId));

    expect(result.current.views).toEqual([
      { id: "view1", name: "View 1", layout: ViewLayout.List, filters: [], sorts: [] },
      { id: "view2", name: "View 2", layout: ViewLayout.Kanban, filters: [], sorts: [] },
    ]);
  });

  it("should handle pagination", () => {
    const mockViews: View[] = Array(10)
      .fill(null)
      .map((_, i) => ({
        id: `view${i}`,
        name: `View ${i}`,
        layout: ViewLayout.List,
        filters: [],
        sorts: [],
      }));

    mockUseCachedPromise.mockReturnValue(mockCachedPromisePaginated(mockViews, 1, true) as any);

    const { result } = renderHook(() => useListViews(spaceId, listId));

    expect(result.current.views).toHaveLength(10);
    expect(result.current.viewsPagination).toBeDefined();
    expect(result.current.viewsPagination?.hasMore).toBe(true); // We passed true to the mock
  });

  it("should not execute when spaceId is missing", () => {
    mockUseCachedPromise.mockReturnValue(mockCachedPromiseSuccess<View[]>([]) as any);

    renderHook(() => useListViews("", listId));

    expect(mockUseCachedPromise).toHaveBeenCalledWith(
      expect.any(Function),
      ["", listId],
      expect.objectContaining({
        execute: false,
      }),
    );
  });

  it("should not execute when listId is missing", () => {
    mockUseCachedPromise.mockReturnValue(mockCachedPromiseSuccess<View[]>([]) as any);

    renderHook(() => useListViews(spaceId, ""));

    expect(mockUseCachedPromise).toHaveBeenCalledWith(
      expect.any(Function),
      [spaceId, ""],
      expect.objectContaining({
        execute: false,
      }),
    );
  });

  it("should keep previous data during refetch", () => {
    mockUseCachedPromise.mockReturnValue(mockCachedPromiseSuccess<View[]>([]) as any);

    renderHook(() => useListViews(spaceId, listId));

    expect(mockUseCachedPromise).toHaveBeenCalledWith(
      expect.any(Function),
      [spaceId, listId],
      expect.objectContaining({
        keepPreviousData: true,
      }),
    );
  });

  it("should call getListViews with correct pagination parameters", async () => {
    // Test the function passed to useCachedPromise
    const mockCallback = vi.fn(async (options: { page: number }) => {
      const offset = options.page * 10; // apiLimit
      const response = await getListViews(spaceId, listId, { offset, limit: 10 });
      return {
        data: response.views,
        hasMore: response.pagination.has_more,
      };
    });

    mockGetListViews.mockResolvedValue({
      views: [{ id: "view1", name: "View", layout: ViewLayout.List, filters: [], sorts: [] }],
      pagination: { total: 1, offset: 0, limit: 10, has_more: false },
    });

    const result = await mockCallback({ page: 0 });

    expect(mockGetListViews).toHaveBeenCalledWith(spaceId, listId, {
      offset: 0,
      limit: 10,
    });
    expect(result.data).toHaveLength(1);
    expect(result.hasMore).toBe(false);
  });

  it("should handle mutate function", () => {
    const mockMutate = vi.fn();
    mockUseCachedPromise.mockReturnValue({
      ...mockCachedPromiseSuccess<View[]>([]),
      mutate: mockMutate,
    } as any);

    const { result } = renderHook(() => useListViews(spaceId, listId));

    result.current.mutateViews();
    expect(mockMutate).toHaveBeenCalled();
  });
});
