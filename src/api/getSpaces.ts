import { mapSpaces } from "../mappers/spaces";
import { DisplaySpace, PaginatedResponse, Pagination, Space } from "../models";
import { apiEndpoints, apiFetch } from "../utils";

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
