import { SpaceObject } from "../helpers/schema";
import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constant";

export async function deleteObject(spaceId: string, objectId: string): Promise<void> {
  const { url, method } = apiEndpoints.deleteObject(spaceId, objectId);

  await apiFetch<SpaceObject>(url, {
    method: method,
  });
}
