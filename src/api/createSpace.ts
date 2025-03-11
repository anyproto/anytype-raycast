import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constant";

export async function createSpace(space: { name: string }): Promise<void> {
  const { url, method } = apiEndpoints.createSpace;

  await apiFetch(url, {
    method: method,
    body: JSON.stringify({ name: space.name }),
  });
}
