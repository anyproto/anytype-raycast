import { mapObjects } from "../mappers/objects";
import { DisplayObject, PaginatedResponse, Pagination, SpaceObject } from "../models";
import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constant";

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
