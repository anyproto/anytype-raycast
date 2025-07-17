import { showToast, Toast } from "@raycast/api";
import { Headers as FetchHeaders } from "node-fetch";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  CreateChallengeRequest,
  CreateChallengeResponse,
} from "../../../models";
import { apiEndpoints, apiFetch, errorConnectionMessage } from "../../../utils";
import { createApiKey } from "../createApiKey";
import { createChallenge } from "../createChallenge";
import { checkApiTokenValidity } from "../validateToken";
vi.mock("@raycast/api", () => ({
  showToast: vi.fn(),
  Toast: {
    Style: {
      Success: "SUCCESS",
      Failure: "FAILURE",
    },
  },
}));

vi.mock("../../../utils", () => ({
  apiEndpoints: {
    getSpaces: vi.fn(),
    createChallenge: vi.fn(),
    createApiKey: vi.fn(),
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

  describe("createApiKey", () => {
    it("should create API key successfully", async () => {
      const mockRequest: CreateApiKeyRequest = {
        challenge_id: "challenge-123",
        code: "code-456",
      };

      const mockResponse: CreateApiKeyResponse = {
        api_key: "test-api-key-123",
      };

      const mockHeaders = new FetchHeaders();
      const mockApiResponse = {
        payload: mockResponse,
        headers: mockHeaders,
      };

      vi.mocked(apiEndpoints.createApiKey).mockReturnValue({
        url: "/api/auth/api_keys",
        method: "POST",
      });
      vi.mocked(apiFetch).mockResolvedValue(mockApiResponse);

      const result = await createApiKey(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(apiEndpoints.createApiKey).toHaveBeenCalled();
      expect(apiFetch).toHaveBeenCalledWith("/api/auth/api_keys", {
        method: "POST",
        body: JSON.stringify(mockRequest),
      });
    });

    it("should propagate errors from apiFetch", async () => {
      const error = new Error("Network error");
      const mockRequest: CreateApiKeyRequest = {
        challenge_id: "challenge-123",
        code: "code-456",
      };

      vi.mocked(apiEndpoints.createApiKey).mockReturnValue({
        url: "/api/auth/api_keys",
        method: "POST",
      });
      vi.mocked(apiFetch).mockRejectedValue(error);

      await expect(createApiKey(mockRequest)).rejects.toThrow("Network error");
    });
  });

  describe("createChallenge", () => {
    it("should create challenge successfully", async () => {
      const mockRequest: CreateChallengeRequest = {
        app_name: "raycast-extension",
      };

      const mockResponse: CreateChallengeResponse = {
        challenge_id: "challenge-id-123",
      };

      const mockHeaders = new FetchHeaders();
      const mockApiResponse = {
        payload: mockResponse,
        headers: mockHeaders,
      };

      vi.mocked(apiEndpoints.createChallenge).mockReturnValue({
        url: "/api/auth/challenges",
        method: "POST",
      });
      vi.mocked(apiFetch).mockResolvedValue(mockApiResponse);

      const result = await createChallenge(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(apiEndpoints.createChallenge).toHaveBeenCalled();
      expect(apiFetch).toHaveBeenCalledWith("/api/auth/challenges", {
        method: "POST",
        body: JSON.stringify(mockRequest),
      });
    });

    it("should handle different client IDs", async () => {
      const mockRequest: CreateChallengeRequest = {
        app_name: "custom-app",
      };

      const mockResponse: CreateChallengeResponse = {
        challenge_id: "challenge-id-456",
      };

      const mockHeaders = new FetchHeaders();
      const mockApiResponse = {
        payload: mockResponse,
        headers: mockHeaders,
      };

      vi.mocked(apiEndpoints.createChallenge).mockReturnValue({
        url: "/api/auth/challenges",
        method: "POST",
      });
      vi.mocked(apiFetch).mockResolvedValue(mockApiResponse);

      const result = await createChallenge(mockRequest);

      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors from apiFetch", async () => {
      const error = new Error("API error");
      const mockRequest: CreateChallengeRequest = {
        app_name: "test-app",
      };

      vi.mocked(apiEndpoints.createChallenge).mockReturnValue({
        url: "/api/auth/challenges",
        method: "POST",
      });
      vi.mocked(apiFetch).mockRejectedValue(error);

      await expect(createChallenge(mockRequest)).rejects.toThrow("API error");
    });
  });
});
