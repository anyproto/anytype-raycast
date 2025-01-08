import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constants";
import { Template, PaginatedResponse } from "../utils/schemas";
import { Pagination } from "../utils/schemas";

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
  const { url, method } = apiEndpoints.getTemplates(spaceId, typeId, options);
  const response = await apiFetch<PaginatedResponse<Template>>(url, { method: method });

  return {
    templates: response.data ? response.data : [],
    pagination: response.pagination,
  };
}
