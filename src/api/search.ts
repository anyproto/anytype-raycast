import { mapObjects } from "../mappers/objects";
import { DisplayObject, PaginatedResponse, SearchRequest, SpaceObject } from "../models";
import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constant";

export async function search(
  spaceId: string,
  SearchRequest: SearchRequest,
  options: { offset: number; limit: number },
): Promise<PaginatedResponse<DisplayObject>> {
  const { url, method } = apiEndpoints.search(spaceId, options);
  const response = await apiFetch<PaginatedResponse<SpaceObject>>(url, {
    method: method,
    body: JSON.stringify(SearchRequest),
  });

  return {
    data: response.payload.data ? await mapObjects(response.payload.data) : [],
    pagination: response.payload.pagination,
  };
}
