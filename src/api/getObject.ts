import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constant";
import { ErrorWithStatus } from "../helpers/error";
import { getIconWithFallback } from "../helpers/icon";
import { DisplayObject, SpaceObject } from "../helpers/schema";
import { mapObject } from "../mappers/objects";

export async function getObject(
  spaceId: string,
  objectId: string,
): Promise<{
  object: DisplayObject | null;
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

export async function getObjectWithoutMappedDetails(spaceId: string, objectId: string): Promise<DisplayObject | null> {
  const { url, method } = apiEndpoints.getObject(spaceId, objectId);
  try {
    const response = await apiFetch<{ object: SpaceObject }>(url, { method });
    if (!response) {
      return null;
    }

    const { object } = response.payload;
    const icon = await getIconWithFallback(object.icon, object.layout, object.type);

    return {
      ...object,
      name: object.name || "Untitled",
      icon,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      (error as ErrorWithStatus).status = 404;
    }
    throw error;
  }
}
