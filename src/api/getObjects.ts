import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { transformObjects } from "../utils/helpers";
import { PaginatedResponse, Pagination, SpaceObject } from "../utils/schemas";

export async function getObjects(spaceId: string): Promise<{
  objects: SpaceObject[];
  pagination: Pagination;
}> {
  const response = await fetch(`${API_URL}/spaces/${spaceId}/objects`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch objects for space ${spaceId}: [${response.status}] ${response.statusText}`,
    );
  }

  const jsonResponse =
    (await response.json()) as PaginatedResponse<SpaceObject>;
  const objects = jsonResponse.data
    ? await transformObjects(jsonResponse.data)
    : [];
  const pagination = jsonResponse.pagination;

  return { objects, pagination };
}
