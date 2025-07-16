import { Response } from "node-fetch";
import { describe, expect, it, vi } from "vitest";
import { checkResponseError, ErrorWithStatus } from "../error";

// Mock Response class
class MockResponse {
  ok: boolean;
  status: number;
  statusText: string;
  private textValue: string;

  constructor(ok: boolean, status: number, statusText: string, textValue = "") {
    this.ok = ok;
    this.status = status;
    this.statusText = statusText;
    this.textValue = textValue;
  }

  async text(): Promise<string> {
    return this.textValue;
  }
}

describe("checkResponseError", () => {
  it("should not throw for successful responses", async () => {
    const response = new MockResponse(true, 200, "OK") as unknown as Response;
    await expect(checkResponseError(response)).resolves.toBeUndefined();
  });

  it("should throw error with status 403 for forbidden requests", async () => {
    const response = new MockResponse(false, 403, "Forbidden") as unknown as Response;

    try {
      await checkResponseError(response);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as ErrorWithStatus).message).toBe("Operation not permitted.");
      expect((error as ErrorWithStatus).status).toBe(403);
    }
  });

  it("should throw error with status 404 for not found requests", async () => {
    const response = new MockResponse(false, 404, "Not Found") as unknown as Response;

    try {
      await checkResponseError(response);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as ErrorWithStatus).message).toBe("Object not found.");
      expect((error as ErrorWithStatus).status).toBe(404);
    }
  });

  it("should throw error with status 410 for gone requests", async () => {
    const response = new MockResponse(false, 410, "Gone") as unknown as Response;

    try {
      await checkResponseError(response);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as ErrorWithStatus).message).toBe("Object has been deleted.");
      expect((error as ErrorWithStatus).status).toBe(410);
    }
  });

  it("should throw error with status 429 for rate limit exceeded", async () => {
    const response = new MockResponse(false, 429, "Too Many Requests") as unknown as Response;

    try {
      await checkResponseError(response);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as ErrorWithStatus).message).toBe("Rate Limit Exceeded: Please try again later.");
      expect((error as ErrorWithStatus).status).toBe(429);
    }
  });

  it("should throw generic error for other status codes", async () => {
    const response = new MockResponse(false, 500, "Internal Server Error") as unknown as Response;

    try {
      await checkResponseError(response);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as ErrorWithStatus).message).toBe("API request failed: [500] Internal Server Error");
      expect((error as ErrorWithStatus).status).toBe(500);
    }
  });

  it("should include error text in generic error message", async () => {
    const response = new MockResponse(
      false,
      500,
      "Internal Server Error",
      "Database connection failed",
    ) as unknown as Response;

    try {
      await checkResponseError(response);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as ErrorWithStatus).message).toBe(
        "API request failed: [500] Internal Server Error Database connection failed",
      );
      expect((error as ErrorWithStatus).status).toBe(500);
    }
  });

  it("should handle text parsing errors gracefully", async () => {
    const response = new MockResponse(false, 502, "Bad Gateway") as unknown as Response;
    // Override text method to throw an error
    response.text = vi.fn().mockRejectedValue(new Error("Text parsing failed"));

    try {
      await checkResponseError(response);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as ErrorWithStatus).message).toBe("API request failed: [502] Bad Gateway");
      expect((error as ErrorWithStatus).status).toBe(502);
    }
  });

  it("should handle empty error text", async () => {
    const response = new MockResponse(false, 400, "Bad Request", "") as unknown as Response;

    try {
      await checkResponseError(response);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as ErrorWithStatus).message).toBe("API request failed: [400] Bad Request");
      expect((error as ErrorWithStatus).status).toBe(400);
    }
  });

  it("should handle various other error status codes", async () => {
    const testCases = [
      { status: 400, statusText: "Bad Request" },
      { status: 401, statusText: "Unauthorized" },
      { status: 405, statusText: "Method Not Allowed" },
      { status: 503, statusText: "Service Unavailable" },
    ];

    for (const { status, statusText } of testCases) {
      const response = new MockResponse(false, status, statusText) as unknown as Response;

      try {
        await checkResponseError(response);
        expect.fail(`Should have thrown an error for status ${status}`);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as ErrorWithStatus).message).toBe(`API request failed: [${status}] ${statusText}`);
        expect((error as ErrorWithStatus).status).toBe(status);
      }
    }
  });
});
