import { showToast, Toast } from "@raycast/api";
import { Headers as FetchHeaders } from "node-fetch";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DisplayCodeResponse, TokenResponse } from "../../models";
import { apiEndpoints, apiFetch, errorConnectionMessage } from "../../utils";
import { displayCode } from "./displayCode";
import { getToken } from "./getToken";
import { checkApiTokenValidity } from "./validateToken";

// Mock dependencies
vi.mock("@raycast/api", () => ({
  showToast: vi.fn(),
  Toast: {
    Style: {
      Success: "SUCCESS",
      Failure: "FAILURE",
    },
  },
}));

vi.mock("../../utils", () => ({
  apiEndpoints: {
    getSpaces: vi.fn(),
    getToken: vi.fn(),
    displayCode: vi.fn(),
  },
  apiFetch: vi.fn(),
  currentApiVersion: "1.0.0",
  errorConnectionMessage: "Connection error",
}));

describe("auth API functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkApiTokenValidity", () => {
    it("should return true when API version matches", async () => {
      const mockHeaders = new FetchHeaders();
      mockHeaders.set("Anytype-Version", "1.0.0");
      const mockResponse = {
        headers: mockHeaders,
        payload: { items: [], total: 0, limit: 1, offset: 0 },
      };

      vi.mocked(apiEndpoints.getSpaces).mockReturnValue({
        url: "/api/spaces",
        method: "GET",
      });
      vi.mocked(apiFetch).mockResolvedValue(mockResponse);

      const result = await checkApiTokenValidity();

      expect(result).toBe(true);
      expect(apiEndpoints.getSpaces).toHaveBeenCalledWith({ offset: 0, limit: 1 });
      expect(showToast).not.toHaveBeenCalled();
    });

    it("should show toast when app version is older", async () => {
      const mockHeaders = new FetchHeaders();
      mockHeaders.set("Anytype-Version", "0.9.0");
      const mockResponse = {
        headers: mockHeaders,
        payload: { items: [], total: 0, limit: 1, offset: 0 },
      };

      vi.mocked(apiEndpoints.getSpaces).mockReturnValue({
        url: "/api/spaces",
        method: "GET",
      });
      vi.mocked(apiFetch).mockResolvedValue(mockResponse);

      const result = await checkApiTokenValidity();

      expect(result).toBe(true);
      expect(showToast).toHaveBeenCalledWith(
        Toast.Style.Failure,
        "App Update Required",
        "Please update the Anytype app to match the extension's API version 1.0.0.",
      );
    });

    it("should show toast when extension version is older", async () => {
      const mockHeaders = new FetchHeaders();
      mockHeaders.set("Anytype-Version", "2.0.0");
      const mockResponse = {
        headers: mockHeaders,
        payload: { items: [], total: 0, limit: 1, offset: 0 },
      };

      vi.mocked(apiEndpoints.getSpaces).mockReturnValue({
        url: "/api/spaces",
        method: "GET",
      });
      vi.mocked(apiFetch).mockResolvedValue(mockResponse);

      const result = await checkApiTokenValidity();

      expect(result).toBe(true);
      expect(showToast).toHaveBeenCalledWith(
        Toast.Style.Failure,
        "Extension Update Required",
        "Please update the extension to match the Anytype app's API version 2.0.0.",
      );
    });

    it("should handle connection errors", async () => {
      const connectionError = new Error(errorConnectionMessage);

      vi.mocked(apiEndpoints.getSpaces).mockReturnValue({
        url: "/api/spaces",
        method: "GET",
      });
      vi.mocked(apiFetch).mockRejectedValue(connectionError);

      const result = await checkApiTokenValidity();

      expect(result).toBe(true);
      expect(showToast).not.toHaveBeenCalled();
    });

    it("should return false for unknown errors", async () => {
      const unknownError = new Error("Unknown error");

      vi.mocked(apiEndpoints.getSpaces).mockReturnValue({
        url: "/api/spaces",
        method: "GET",
      });
      vi.mocked(apiFetch).mockRejectedValue(unknownError);

      const result = await checkApiTokenValidity();

      expect(result).toBe(false);
    });

    it("should handle non-Error exceptions", async () => {
      vi.mocked(apiEndpoints.getSpaces).mockReturnValue({
        url: "/api/spaces",
        method: "GET",
      });
      vi.mocked(apiFetch).mockRejectedValue("String error");

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await checkApiTokenValidity();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith("Unknown error:", "String error");

      consoleSpy.mockRestore();
    });

    it("should handle missing API version header", async () => {
      const mockHeaders = new FetchHeaders();
      const mockResponse = {
        headers: mockHeaders,
        payload: { items: [], total: 0, limit: 1, offset: 0 },
      };

      vi.mocked(apiEndpoints.getSpaces).mockReturnValue({
        url: "/api/spaces",
        method: "GET",
      });
      vi.mocked(apiFetch).mockResolvedValue(mockResponse);

      const result = await checkApiTokenValidity();

      expect(result).toBe(true);
      expect(showToast).toHaveBeenCalledWith(
        Toast.Style.Failure,
        "App Update Required",
        "Please update the Anytype app to match the extension's API version 1.0.0.",
      );
    });
  });

  describe("getToken", () => {
    it("should fetch and return token successfully", async () => {
      const mockTokenResponse: TokenResponse = {
        session_token: "test-token-123",
        app_key: "app-key-123",
      };

      const mockHeaders = new FetchHeaders();
      const mockResponse = {
        payload: mockTokenResponse,
        headers: mockHeaders,
      };

      vi.mocked(apiEndpoints.getToken).mockReturnValue({
        url: "/api/auth/token",
        method: "POST",
      });
      vi.mocked(apiFetch).mockResolvedValue(mockResponse);

      const result = await getToken("challenge123", "code456");

      expect(result).toEqual(mockTokenResponse);
      expect(apiEndpoints.getToken).toHaveBeenCalledWith("challenge123", "code456");
      expect(apiFetch).toHaveBeenCalledWith("/api/auth/token", { method: "POST" });
    });

    it("should propagate errors from apiFetch", async () => {
      const error = new Error("Network error");

      vi.mocked(apiEndpoints.getToken).mockReturnValue({
        url: "/api/auth/token",
        method: "POST",
      });
      vi.mocked(apiFetch).mockRejectedValue(error);

      await expect(getToken("challenge123", "code456")).rejects.toThrow("Network error");
    });
  });

  describe("displayCode", () => {
    it("should fetch and return display code successfully", async () => {
      const mockDisplayCodeResponse: DisplayCodeResponse = {
        challenge_id: "challenge-id-123",
      };

      const mockHeaders = new FetchHeaders();
      const mockResponse = {
        payload: mockDisplayCodeResponse,
        headers: mockHeaders,
      };

      vi.mocked(apiEndpoints.displayCode).mockReturnValue({
        url: "/api/auth/display-code",
        method: "POST",
      });
      vi.mocked(apiFetch).mockResolvedValue(mockResponse);

      const result = await displayCode("Raycast Extension");

      expect(result).toEqual(mockDisplayCodeResponse);
      expect(apiEndpoints.displayCode).toHaveBeenCalledWith("Raycast Extension");
      expect(apiFetch).toHaveBeenCalledWith("/api/auth/display-code", { method: "POST" });
    });

    it("should handle different app names", async () => {
      const mockDisplayCodeResponse: DisplayCodeResponse = {
        challenge_id: "challenge-id-456",
      };

      const mockHeaders = new FetchHeaders();
      const mockResponse = {
        payload: mockDisplayCodeResponse,
        headers: mockHeaders,
      };

      vi.mocked(apiEndpoints.displayCode).mockReturnValue({
        url: "/api/auth/display-code",
        method: "POST",
      });
      vi.mocked(apiFetch).mockResolvedValue(mockResponse);

      const result = await displayCode("Custom App");

      expect(result).toEqual(mockDisplayCodeResponse);
      expect(apiEndpoints.displayCode).toHaveBeenCalledWith("Custom App");
    });

    it("should propagate errors from apiFetch", async () => {
      const error = new Error("API error");

      vi.mocked(apiEndpoints.displayCode).mockReturnValue({
        url: "/api/auth/display-code",
        method: "POST",
      });
      vi.mocked(apiFetch).mockRejectedValue(error);

      await expect(displayCode("Test App")).rejects.toThrow("API error");
    });
  });
});
