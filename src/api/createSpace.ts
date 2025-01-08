import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constants";

export async function createSpace(objectData: { name: string }): Promise<void> {
  const { url, method } = apiEndpoints.createSpace;

  await apiFetch(url, {
    method: method,
    body: JSON.stringify({ name: objectData.name }),
  });
}
