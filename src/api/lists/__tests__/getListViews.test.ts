import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApiResponse, createPaginatedResponse, TEST_IDS } from "../../../test";
import { apiEndpoints, apiFetch } from "../../../utils";
import { getListViews } from "../getListViews";

vi.mock("../../../utils/api");

const mockApiFetch = vi.mocked(apiFetch);

describe("getListViews", () => {
  const spaceId = TEST_IDS.space;
  const listId = TEST_IDS.list;
  const options = { offset: 0, limit: 10 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch list views successfully", async () => {
    const mockViews = [
      { id: "view1", name: "Default View", type: "table" },
      { id: "view2", name: "Board View", type: "board" },
    ];

    const paginatedResponse = createPaginatedResponse(mockViews, {
      total: 2,
      offset: 0,
      limit: 10,
      hasMore: false,
    });

    const mockResponse = createApiResponse(paginatedResponse);

    mockApiFetch.mockResolvedValue(mockResponse);

    const result = await getListViews(spaceId, listId, options);

    expect(mockApiFetch).toHaveBeenCalledWith(apiEndpoints.getListViews(spaceId, listId, options).url, {
      method: apiEndpoints.getListViews(spaceId, listId, options).method,
    });

    expect(result).toEqual({
      views: mockViews,
      pagination: mockResponse.payload.pagination,
    });
  });

  it("should handle empty views list", async () => {
    const paginatedResponse = createPaginatedResponse([], {
      total: 0,
      offset: 0,
      limit: 10,
      hasMore: false,
    });

    const mockResponse = createApiResponse(paginatedResponse);

    mockApiFetch.mockResolvedValue(mockResponse);

    const result = await getListViews(spaceId, listId, options);

    expect(result.views).toEqual([]);
    expect(result.pagination.total).toBe(0);
  });

  it("should handle pagination correctly", async () => {
    const mockViews = Array(10)
      .fill(null)
      .map((_, i) => ({
        id: `view${i}`,
        name: `View ${i}`,
        type: "table",
      }));

    const paginatedResponse = createPaginatedResponse(mockViews, {
      total: 25,
      offset: 10,
      limit: 10,
      hasMore: true,
    });

    const mockResponse = createApiResponse(paginatedResponse);

    mockApiFetch.mockResolvedValue(mockResponse);

    const paginatedOptions = { offset: 10, limit: 10 };
    const result = await getListViews(spaceId, listId, paginatedOptions);

    expect(mockApiFetch).toHaveBeenCalledWith(apiEndpoints.getListViews(spaceId, listId, paginatedOptions).url, {
      method: apiEndpoints.getListViews(spaceId, listId, paginatedOptions).method,
    });

    expect(result.views).toHaveLength(10);
    expect(result.pagination.has_more).toBe(true);
    expect(result.pagination.offset).toBe(10);
  });

  it("should propagate errors from apiFetch", async () => {
    const error = new Error("Network error");
    mockApiFetch.mockRejectedValue(error);

    await expect(getListViews(spaceId, listId, options)).rejects.toThrow("Network error");
  });

  it("should handle malformed response", async () => {
    // Test with response missing expected structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockApiFetch.mockResolvedValue({ payload: {} } as any);

    // This should not throw but return undefined values
    const result = await getListViews(spaceId, listId, options);
    expect(result.views).toBeUndefined();
    expect(result.pagination).toBeUndefined();
  });
});
