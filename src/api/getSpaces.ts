import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constant";
import { DisplaySpace, PaginatedResponse, Pagination, Space } from "../helpers/schema";
import { mapSpaces } from "../mappers/spaces";

export async function getSpaces(options: { offset: number; limit: number }): Promise<{
  spaces: DisplaySpace[];
  pagination: Pagination;
}> {
  const { url, method } = apiEndpoints.getSpaces(options);
  const response = await apiFetch<PaginatedResponse<Space>>(url, { method: method });

  return {
    spaces: response.payload.data ? await mapSpaces(response.payload.data) : [],
    pagination: response.payload.pagination,
  };
}
