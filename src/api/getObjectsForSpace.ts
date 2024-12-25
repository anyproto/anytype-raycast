import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { transformObjects } from "../utils/helpers";
import { ObjectResponse, Pagination, SpaceObject } from "../utils/schemas";

export async function getObjectsForSpace(spaceId: string): Promise<{
  objects: SpaceObject[];
  pagination: Pagination;
}> {
  const response = await fetch(`${API_URL}/spaces/${spaceId}/objects`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch objects for space ${spaceId}: [${response.status}] ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ObjectResponse;
  const objects = data.objects ? await transformObjects(data.objects) : [];
  const pagination = data.pagination;

  return { objects, pagination };
}
