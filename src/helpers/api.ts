import { LocalStorage } from "@raycast/api";
import fetch, { Headers as FetchHeaders, Response } from "node-fetch";
import { errorConnectionMessage, localStorageKeys } from "./constants";

interface FetchOptions {
  method: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface ApiResponse<T> {
  headers: FetchHeaders;
  payload: T;
}

/**
 * Centralized function to check the HTTP response.
 * Throws errors with clear messages for common error codes.
 * @param response The response object to check.
 */
async function checkResponseError(response: Response): Promise<void> {
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

/**
 * A central API fetch function that applies uniform error handling.
 * @param url The URL to fetch.
 * @param options The fetch options.
 * @returns The API response.
 */
export async function apiFetch<T>(url: string, options: FetchOptions): Promise<ApiResponse<T>> {
  try {
    const token = await LocalStorage.getItem(localStorageKeys.appKey);
    const response = await fetch(url, {
      method: options.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...options.headers,
      },
      body: options.body,
    });

    await checkResponseError(response);

    try {
      const json = (await response.json()) as T;
      return {
        payload: json,
        headers: response.headers,
      };
    } catch (jsonError) {
      throw new Error("Failed to parse JSON response");
    }
  } catch (error) {
    if (error instanceof Error && (error as { code?: string }).code === "ECONNREFUSED") {
      throw new Error(errorConnectionMessage);
    }
    throw error;
  }
}
