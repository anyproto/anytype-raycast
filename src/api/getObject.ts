import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constants";
import { ErrorWithStatus } from "../helpers/errors";
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
      object: response ? await mapObject(response.payload.object) : null,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      (error as ErrorWithStatus).status = 404;
    }
    throw error;
  }
}

export async function getRawObject(spaceId: string, objectId: string): Promise<SpaceObject | null> {
  const { url, method } = apiEndpoints.getObject(spaceId, objectId);
  try {
    const response = await apiFetch<{ object: SpaceObject }>(url, { method });
    return response ? response.payload.object : null;
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      (error as ErrorWithStatus).status = 404;
    }
    throw error;
  }
}
