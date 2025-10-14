import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddObjectsToListRequest } from "../../../models";
import { createApiResponse, TEST_IDS } from "../../../test";
import { apiEndpoints, apiFetch } from "../../../utils";
import { addObjectsToList } from "../addObjectsToList";

vi.mock("../../../utils/api");

const mockApiFetch = vi.mocked(apiFetch);

describe("addObjectsToList", () => {
  const spaceId = TEST_IDS.space;
  const listId = TEST_IDS.list;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should add single object to list successfully", async () => {
    const request: AddObjectsToListRequest = {
      objects: ["obj1"],
    };

    const mockResponse = createApiResponse("Objects added successfully");
    mockApiFetch.mockResolvedValue(mockResponse);

    const result = await addObjectsToList(spaceId, listId, request);

    const endpoint = apiEndpoints.addObjectsToList(spaceId, listId);
    expect(mockApiFetch).toHaveBeenCalledWith(endpoint.url, {
      method: endpoint.method,
      body: JSON.stringify(request),
    });

    expect(result).toEqual(mockResponse);
  });

  it("should add multiple objects to list", async () => {
    const request: AddObjectsToListRequest = {
      objects: ["obj1", "obj2", "obj3"],
    };

    const mockResponse = createApiResponse("3 objects added successfully");
    mockApiFetch.mockResolvedValue(mockResponse);

    const result = await addObjectsToList(spaceId, listId, request);

    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify(request),
      }),
    );

    expect(result.payload).toBe("3 objects added successfully");
  });

  it("should handle empty object list", async () => {
    const request: AddObjectsToListRequest = {
      objects: [],
    };

    const mockResponse = createApiResponse("No objects to add");
    mockApiFetch.mockResolvedValue(mockResponse);

    const result = await addObjectsToList(spaceId, listId, request);

    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ objects: [] }),
      }),
    );

    expect(result.payload).toBe("No objects to add");
  });

  it("should propagate API errors", async () => {
    const request: AddObjectsToListRequest = {
      objects: ["obj1"],
    };

    const error = new Error("Unauthorized");
    mockApiFetch.mockRejectedValue(error);

    await expect(addObjectsToList(spaceId, listId, request)).rejects.toThrow("Unauthorized");
  });

  it("should handle network errors", async () => {
    const request: AddObjectsToListRequest = {
      objects: ["obj1"],
    };

    const error = new Error("Network request failed");
    mockApiFetch.mockRejectedValue(error);

    await expect(addObjectsToList(spaceId, listId, request)).rejects.toThrow("Network request failed");
  });
});
