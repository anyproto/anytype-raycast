import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constants";
import { Type, PaginatedResponse } from "../utils/schemas";
import { transformTypes } from "../utils/helpers";
import { Pagination } from "../utils/schemas";

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
  const { url, method } = apiEndpoints.getTypes(spaceId, options);
  const response = await apiFetch<PaginatedResponse<Type>>(url, { method: method });

  return {
    types: response.data ? await transformTypes(response.data) : [],
    pagination: response.pagination,
  };
}
