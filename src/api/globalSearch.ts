import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constants";
import { DisplayObject, PaginatedResponse, SearchRequest, SpaceObject } from "../helpers/schemas";
import { mapObjects } from "../mappers/objects";

export async function globalSearch(
  SearchRequest: SearchRequest,
  options: { offset: number; limit: number },
): Promise<PaginatedResponse<DisplayObject>> {
  const { url, method } = apiEndpoints.globalSearch(options);
  const response = await apiFetch<PaginatedResponse<SpaceObject>>(url, {
    method: method,
    body: JSON.stringify(SearchRequest),
  });

  return {
    data: response.payload.data ? await mapObjects(response.payload.data) : [],
    pagination: response.payload.pagination,
  };
}
