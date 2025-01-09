import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constants";
import { DisplayCodeResponse } from "../utils/schemas";

export async function displayCode(): Promise<DisplayCodeResponse> {
  const { url, method } = apiEndpoints.displayCode;
  return await apiFetch<DisplayCodeResponse>(url, { method: method });
}
