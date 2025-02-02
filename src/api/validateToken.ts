import { apiFetch } from "../helpers/api";
import { apiEndpoints, errorConnectionMessage } from "../helpers/constants";
import { PaginatedResponse, Space } from "../helpers/schemas";

// Validate token by checking if data can be fetched without errors
export async function validateToken(): Promise<boolean> {
  try {
    const { url, method } = apiEndpoints.getSpaces({ offset: 0, limit: 1 });
    await apiFetch<PaginatedResponse<Space>>(url, { method: method });
    return true;
  } catch (error) {
    if (error instanceof Error) {
      return error.message == errorConnectionMessage;
    } else {
      console.error("Unknown error:", error);
      return false;
    }
  }
}
