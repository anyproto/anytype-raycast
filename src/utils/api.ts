import fetch from "node-fetch";

interface FetchOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

export async function apiFetch<T>(url: string, options: FetchOptions): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("It seems you're not logged in. Please log in and try again.");
      } else {
        throw new Error(`API request failed: [${response.status}] ${response.statusText}`);
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
