import { mapTemplates } from "../mappers/templates";
import { DisplayTemplate, PaginatedResponse, Pagination, Template } from "../models";
import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constant";

export async function getTemplates(
  spaceId: string,
  typeId: string,
  options: {
    offset: number;
    limit: number;
  },
): Promise<{
  templates: DisplayTemplate[];
  pagination: Pagination;
}> {
  const { url, method } = apiEndpoints.getTemplates(spaceId, typeId, options);
  const response = await apiFetch<PaginatedResponse<Template>>(url, { method: method });

  return {
    templates: response.payload.data ? await mapTemplates(response.payload.data) : [],
    pagination: response.payload.pagination,
  };
}
