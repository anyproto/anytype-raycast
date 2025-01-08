import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constants";

export async function deleteObject(spaceId: string, objectId: string): Promise<void> {
  const { url, method } = apiEndpoints.deleteObject(spaceId, objectId);

  await apiFetch(url, {
    method: method,
  });
}
