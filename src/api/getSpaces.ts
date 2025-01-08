import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constants";
import { PaginatedResponse } from "../utils/schemas";
import { transformSpace } from "../utils/helpers";
import { Space, Pagination } from "../utils/schemas";

export async function getSpaces(options: { offset: number; limit: number }): Promise<{
  spaces: Space[];
  pagination: Pagination;
}> {
  const { url, method } = apiEndpoints.getSpaces(options);
  const response = await apiFetch<PaginatedResponse<Space>>(url, { method: method });

  return {
    spaces: response.data ? await transformSpace(response.data) : [],
    pagination: response.pagination,
  };
}
