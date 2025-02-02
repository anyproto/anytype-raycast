import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constants";
import { PaginatedResponse, Pagination, SpaceObject } from "../helpers/schemas";
import { mapObjects } from "../mappers/objects";

export async function getObjects(
  spaceId: string,
  options: { offset: number; limit: number },
): Promise<{
  objects: SpaceObject[];
  pagination: Pagination;
}> {
  const { url, method } = apiEndpoints.getObjects(spaceId, options);
  const response = await apiFetch<PaginatedResponse<SpaceObject>>(url, { method: method });

  return {
    objects: response.data ? await mapObjects(response.data) : [],
    pagination: response.pagination,
  };
}
