import { mapObject } from "../mappers/objects";
import { CreateObjectRequest, DisplayObject, SpaceObject } from "../models";
import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constant";

export async function createObject(
  spaceId: string,
  objectData: CreateObjectRequest,
): Promise<{ object: DisplayObject | null }> {
  const { url, method } = apiEndpoints.createObject(spaceId);

  const response = await apiFetch<{ object: SpaceObject }>(url, {
    method: method,
    body: JSON.stringify(objectData),
  });

  return {
    object: response ? await mapObject(response.payload.object) : null,
  };
}
