import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constant";

export async function addObjectsToList(spaceId: string, listId: string, objectIds: string[]): Promise<void> {
  const { url, method } = apiEndpoints.addObjectsToList(spaceId, listId);

  await apiFetch(url, {
    method: method,
    body: JSON.stringify(objectIds),
  });
}
