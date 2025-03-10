import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constants";
import { DisplayObject, PaginatedResponse, Pagination, SpaceObject } from "../helpers/schemas";
import { mapObjects } from "../mappers/objects";

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
