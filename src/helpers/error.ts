import { Response } from "node-fetch";

export interface ErrorWithStatus extends Error {
  status: number;
}

/**
 * Centralized function to check the HTTP response.
 * Throws errors with clear messages for common error codes.
 * @param response The response object to check.
 */
export async function checkResponseError(response: Response): Promise<void> {
  if (response.ok) return;

  let errorMessage = `API request failed: [${response.status}] ${response.statusText}`;
  try {
    const errorText = await response.text();
    if (errorText) {
      errorMessage += ` ${errorText}`;
    }
  } catch (e) {
    // ignore errors during error text parsing
  }

  switch (response.status) {
    case 429:
      throw new Error("Rate Limit Exceeded: Please try again later.");
    case 403:
      throw new Error("Operation not permitted.");
    case 404:
      throw new Error("Resource not found (404).");
    default:
      throw new Error(errorMessage);
  }
}
