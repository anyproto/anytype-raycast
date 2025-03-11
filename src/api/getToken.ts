import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constant";
import { TokenResponse } from "../helpers/schema";

export async function getToken(challengeId: string, code: string): Promise<TokenResponse> {
  const { url, method } = apiEndpoints.getToken(challengeId, code);
  const response = await apiFetch<TokenResponse>(url, { method: method });
  return response.payload;
}
