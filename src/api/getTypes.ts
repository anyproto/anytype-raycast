import { mapTypes } from "../mappers/types";
import { DisplayType, PaginatedResponse, Pagination, Type } from "../models";
import { apiEndpoints, apiFetch } from "../utils";

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
