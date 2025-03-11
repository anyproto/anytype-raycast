import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constant";
import { DisplayObject, PaginatedResponse, Pagination, SpaceObject } from "../helpers/schema";
import { mapObjects } from "../mappers/objects";

export async function getObjectsInList(
  spaceId: string,
  listId: string,
  options: { offset: number; limit: number },
): Promise<{
  objects: DisplayObject[];
  pagination: Pagination;
}> {
  const { url, method } = apiEndpoints.getObjectsInList(spaceId, listId, options);
  const response = await apiFetch<PaginatedResponse<SpaceObject>>(url, { method: method });

  return {
    objects: response.payload.data ? await mapObjects(response.payload.data) : [],
    pagination: response.payload.pagination,
  };
}
