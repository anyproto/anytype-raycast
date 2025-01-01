import { apiFetch } from "../utils/api";
import { API_URL } from "../utils/constants";
import { transformObjects } from "../utils/helpers";
import { PaginatedResponse, Pagination, SpaceObject } from "../utils/schemas";
import { encodeQueryParams } from "../utils/helpers";

export async function getObjects(
  spaceId: string,
  options: { offset: number; limit: number },
): Promise<{
  objects: SpaceObject[];
  pagination: Pagination;
}> {
  const queryString = encodeQueryParams(options);
  const url = `${API_URL}/spaces/${spaceId}/objects${queryString}`;

  const response = await apiFetch<PaginatedResponse<SpaceObject>>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return {
    objects: response.data ? await transformObjects(response.data) : [],
    pagination: response.pagination,
  };
}
