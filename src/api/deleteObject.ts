import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constant";
import { SpaceObject } from "../helpers/schema";

export async function deleteObject(spaceId: string, objectId: string): Promise<void> {
  const { url, method } = apiEndpoints.deleteObject(spaceId, objectId);

  await apiFetch<SpaceObject>(url, {
    method: method,
  });
}
