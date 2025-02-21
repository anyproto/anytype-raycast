import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constants";
import { DisplayCodeResponse } from "../helpers/schemas";

export async function displayCode(appName: string): Promise<DisplayCodeResponse> {
  const { url, method } = apiEndpoints.displayCode(appName);
  const response = await apiFetch<DisplayCodeResponse>(url, { method: method });
  return response.payload;
}
