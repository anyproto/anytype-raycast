import { DisplayType, PaginatedResponse, Pagination, Type } from "../helpers/schema";
import { mapTypes } from "../mappers/types";
import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constant";

export async function getTypes(
  spaceId: string,
  options: {
    offset: number;
    limit: number;
  },
): Promise<{
  types: DisplayType[];
  pagination: Pagination;
}> {
  const { url, method } = apiEndpoints.getTypes(spaceId, options);
  const response = await apiFetch<PaginatedResponse<Type>>(url, { method: method });

  return {
    types: response.payload.data ? await mapTypes(response.payload.data) : [],
    pagination: response.payload.pagination,
  };
}
