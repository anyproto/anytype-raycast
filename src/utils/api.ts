import fetch from "node-fetch";
import { LocalStorage } from "@raycast/api";

interface FetchOptions {
  method: string;
  headers?: Record<string, string>;
  body?: string;
}

export async function apiFetch<T>(url: string, options: FetchOptions): Promise<T> {
  try {
    const response = await fetch(url, {
      method: options.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await LocalStorage.getItem("app_key")}`,
        ...options.headers,
      },
      body: options.body,
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("It seems you're not logged in. Please log in and try again.");
      } else {
        throw new Error(`API request failed: [${response.status}] ${response.statusText} ${await response.text()}`);
      }
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new Error("Failed to parse JSON response");
    }
  } catch (error) {
    if (error instanceof Error && error.name === "FetchError") {
      throw new Error("Please ensure Anytype is running and reachable.");
    } else {
      throw error;
    }
  }
}
