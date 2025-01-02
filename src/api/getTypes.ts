import { apiFetch } from "../utils/api";
import { API_URL } from "../utils/constants";
import { Type, PaginatedResponse } from "../utils/schemas";
import { transformTypes } from "../utils/helpers";
import { Pagination } from "../utils/schemas";
import { encodeQueryParams } from "../utils/helpers";

export async function getTypes(
  spaceId: string,
  options: {
    offset: number;
    limit: number;
  },
): Promise<{
  types: Type[];
  pagination: Pagination;
}> {
  const queryString = encodeQueryParams(options);
  const url = `${API_URL}/spaces/${spaceId}/objectTypes${queryString}`;

  const response = await apiFetch<PaginatedResponse<Type>>(url, { method: "GET" });

  return {
    types: response.data ? await transformTypes(response.data) : [],
    pagination: response.pagination,
  };
}
