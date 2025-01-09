import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constants";
import { TokenResponse } from "../utils/schemas";

export async function getToken(challengeId: string, code: string): Promise<TokenResponse> {
  const { url, method } = apiEndpoints.getToken(challengeId, code);
  return await apiFetch<TokenResponse>(url, { method: method });
}
