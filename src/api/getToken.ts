import { TokenResponse } from "../models";
import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constant";

export async function getToken(challengeId: string, code: string): Promise<TokenResponse> {
  const { url, method } = apiEndpoints.getToken(challengeId, code);
  const response = await apiFetch<TokenResponse>(url, { method: method });
  return response.payload;
}
