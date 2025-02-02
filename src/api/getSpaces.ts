import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constants";
import { PaginatedResponse, Pagination, Space } from "../helpers/schemas";
import { mapSpaces } from "../mappers/spaces";

export async function getSpaces(options: { offset: number; limit: number }): Promise<{
  spaces: Space[];
  pagination: Pagination;
}> {
  const { url, method } = apiEndpoints.getSpaces(options);
  const response = await apiFetch<PaginatedResponse<Space>>(url, { method: method });

  return {
    spaces: response.data ? await mapSpaces(response.data) : [],
    pagination: response.pagination,
  };
}
