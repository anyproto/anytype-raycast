import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constants";
import { Space, PaginatedResponse } from "../helpers/schemas";

// Validate token by checking if data can be fetched without errors
export async function validateToken(): Promise<boolean> {
  try {
    const { url, method } = apiEndpoints.getSpaces({ offset: 0, limit: 1 });
    await apiFetch<PaginatedResponse<Space>>(url, { method: method });
    return true;
  } catch (error) {
    return false;
  }
}
