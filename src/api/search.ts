import { apiFetch } from "../utils/api";
import { API_URL } from "../utils/constants";
import { SpaceObject, PaginatedResponse } from "../utils/schemas";
import { transformObjects } from "../utils/helpers";
import { encodeQueryParams } from "../utils/helpers";

export async function search(
  searchText: string,
  types: string[],
  options: { offset: number; limit: number },
): Promise<PaginatedResponse<SpaceObject>> {
  const queryString = encodeQueryParams({
    query: searchText,
    object_types: types,
    offset: options.offset,
    limit: options.limit,
  });
  const url = `${API_URL}/search${queryString}`;

  const response = await apiFetch<PaginatedResponse<SpaceObject>>(url, { method: "GET" });

  return {
    data: response.data ? await transformObjects(response.data) : [],
    pagination: response.pagination,
  };
}
