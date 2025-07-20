import { LocalStorage, getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../api";

// Mock dependencies
vi.mock("node-fetch", () => ({
  default: vi.fn(),
}));

vi.mock("../error", () => ({
  checkResponseError: vi.fn(),
}));

import { checkResponseError } from "../error";

describe("apiFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPreferenceValues).mockReturnValue({ apiKey: "" });
    vi.mocked(LocalStorage.getItem).mockResolvedValue(undefined);
  });

  it("should include token from preferences in Authorization header", async () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ apiKey: "pref-token" });

    const mockResponse = {
      json: vi.fn().mockResolvedValue({ data: "test" }),
      headers: { get: vi.fn() },
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as never);
    vi.mocked(checkResponseError).mockResolvedValue(undefined);

    await apiFetch("https://api.example.com/test", { method: "GET" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer pref-token",
        }),
      }),
    );
  });

  it("should include token from LocalStorage when no preference token", async () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ apiKey: "" });
    vi.mocked(LocalStorage.getItem).mockResolvedValue("storage-token");

    const mockResponse = {
      json: vi.fn().mockResolvedValue({ data: "test" }),
      headers: { get: vi.fn() },
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as never);
    vi.mocked(checkResponseError).mockResolvedValue(undefined);

    await apiFetch("https://api.example.com/test", { method: "GET" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer storage-token",
        }),
      }),
    );
  });

  it("should not include Authorization header when no token available", async () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ apiKey: "" });
    vi.mocked(LocalStorage.getItem).mockResolvedValue(undefined);

    const mockResponse = {
      json: vi.fn().mockResolvedValue({ data: "test" }),
      headers: { get: vi.fn() },
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as never);
    vi.mocked(checkResponseError).mockResolvedValue(undefined);

    await apiFetch("https://api.example.com/test", { method: "GET" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/test",
      expect.objectContaining({
        headers: expect.not.objectContaining({
          Authorization: expect.any(String),
        }),
      }),
    );
  });

  it("should include standard headers", async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ data: "test" }),
      headers: { get: vi.fn() },
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as never);
    vi.mocked(checkResponseError).mockResolvedValue(undefined);

    await apiFetch("https://api.example.com/test", { method: "GET" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "Anytype-Version": expect.any(String),
        }),
      }),
    );
  });

  it("should merge custom headers", async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ data: "test" }),
      headers: { get: vi.fn() },
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as never);
    vi.mocked(checkResponseError).mockResolvedValue(undefined);

    await apiFetch("https://api.example.com/test", {
      method: "GET",
      headers: { "X-Custom": "value" },
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Custom": "value",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("should pass body to fetch", async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ data: "test" }),
      headers: { get: vi.fn() },
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as never);
    vi.mocked(checkResponseError).mockResolvedValue(undefined);

    const body = JSON.stringify({ key: "value" });
    await apiFetch("https://api.example.com/test", { method: "POST", body });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/test",
      expect.objectContaining({
        body,
      }),
    );
  });

  it("should return payload and headers", async () => {
    const mockData = { id: 1, name: "Test" };
    const mockHeaders = { get: vi.fn() };
    const mockResponse = {
      json: vi.fn().mockResolvedValue(mockData),
      headers: mockHeaders,
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as never);
    vi.mocked(checkResponseError).mockResolvedValue(undefined);

    const result = await apiFetch("https://api.example.com/test", { method: "GET" });

    expect(result).toEqual({
      payload: mockData,
      headers: mockHeaders,
    });
  });

  it("should throw error when JSON parsing fails", async () => {
    const mockResponse = {
      json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
      headers: { get: vi.fn() },
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as never);
    vi.mocked(checkResponseError).mockResolvedValue(undefined);

    await expect(apiFetch("https://api.example.com/test", { method: "GET" })).rejects.toThrow(
      "Failed to parse JSON response",
    );
  });

  it("should handle ECONNREFUSED error", async () => {
    const connectionError = new Error("Connection refused") as Error & { code: string };
    connectionError.code = "ECONNREFUSED";
    vi.mocked(fetch).mockRejectedValue(connectionError);

    await expect(apiFetch("https://api.example.com/test", { method: "GET" })).rejects.toThrow(
      "Can't connect to API. Please ensure Anytype is running and reachable.",
    );
  });

  it("should re-throw other errors", async () => {
    const genericError = new Error("Network error");
    vi.mocked(fetch).mockRejectedValue(genericError);

    await expect(apiFetch("https://api.example.com/test", { method: "GET" })).rejects.toThrow("Network error");
  });

  it("should call checkResponseError with response", async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ data: "test" }),
      headers: { get: vi.fn() },
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as never);
    vi.mocked(checkResponseError).mockResolvedValue(undefined);

    await apiFetch("https://api.example.com/test", { method: "GET" });

    expect(checkResponseError).toHaveBeenCalledWith(mockResponse);
  });
});
