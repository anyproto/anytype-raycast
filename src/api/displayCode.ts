import { DisplayCodeResponse } from "../models";
import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constant";

export async function displayCode(appName: string): Promise<DisplayCodeResponse> {
  const { url, method } = apiEndpoints.displayCode(appName);
  const response = await apiFetch<DisplayCodeResponse>(url, { method: method });
  return response.payload;
}
