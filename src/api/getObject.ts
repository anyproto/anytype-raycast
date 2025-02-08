import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constants";
import { SpaceObject } from "../helpers/schemas";
import { mapObject } from "../mappers/objects";

export async function getObject(
  spaceId: string,
  objectId: string,
): Promise<{
  object: SpaceObject | null;
}> {
  const { url, method } = apiEndpoints.getObject(spaceId, objectId);
  try {
    const response = await apiFetch<{ object: SpaceObject }>(url, { method: method });
    return {
      object: response ? await mapObject(response.object) : null,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return {
        object: null,
      };
    }
    throw error;
  }
}
