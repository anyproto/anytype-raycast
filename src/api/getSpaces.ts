import { apiFetch } from "../utils/api";
import { API_URL } from "../utils/constants";
import { PaginatedResponse } from "../utils/schemas";
import { transformSpace } from "../utils/helpers";
import { Space, Pagination } from "../utils/schemas";
import { encodeQueryParams } from "../utils/helpers";

export async function getSpaces(options: { offset: number; limit: number }): Promise<{
  spaces: Space[];
  pagination: Pagination;
}> {
  const queryParams = encodeQueryParams(options);
  const url = `${API_URL}/spaces${queryParams}`;

  const response = await apiFetch<PaginatedResponse<Space>>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return {
    spaces: response.data ? await transformSpace(response.data) : [],
    pagination: response.pagination,
  };
}
