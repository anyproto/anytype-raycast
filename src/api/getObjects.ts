import { DisplayObject, PaginatedResponse, Pagination, SpaceObject } from "../helpers/schema";
import { mapObjects } from "../mappers/objects";
import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constant";

export async function getObjects(
  spaceId: string,
  options: { offset: number; limit: number },
): Promise<{
  objects: DisplayObject[];
  pagination: Pagination;
}> {
  const { url, method } = apiEndpoints.getObjects(spaceId, options);
  const response = await apiFetch<PaginatedResponse<SpaceObject>>(url, { method: method });

  return {
    objects: response.payload.data ? await mapObjects(response.payload.data) : [],
    pagination: response.payload.pagination,
  };
}
