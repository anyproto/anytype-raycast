import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constants";
import { DisplayCodeResponse } from "../helpers/schemas";

export async function displayCode(): Promise<DisplayCodeResponse> {
  const { url, method } = apiEndpoints.displayCode;
  return await apiFetch<DisplayCodeResponse>(url, { method: method });
}
