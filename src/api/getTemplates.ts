import { apiFetch } from "./apiClient";
import { API_URL } from "../utils/constants";
import { Template, PaginatedResponse } from "../utils/schemas";
import { Pagination } from "../utils/schemas";
import { encodeQueryParams } from "../utils/helpers";

export async function getTemplates(
  spaceId: string,
  typeId: string,
  options: {
    offset: number;
    limit: number;
  },
): Promise<{
  templates: Template[];
  pagination: Pagination;
}> {
  const queryString = encodeQueryParams(options);
  const url = `${API_URL}/spaces/${spaceId}/objectTypes/${typeId}/templates${queryString}`;
  const response = await apiFetch<PaginatedResponse<Template>>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return {
    templates: response.data ? response.data : [],
    pagination: response.pagination,
  };
}
