import { PaginatedResponse, Pagination, Tag } from "../../models";
import { apiEndpoints, apiFetch } from "../../utils";

export async function getTags(
  spaceId: string,
  propertyId: string,
  options: { offset: number; limit: number },
): Promise<{
  tags: Tag[];
  pagination: Pagination;
}> {
  const { url, method } = apiEndpoints.getTags(spaceId, propertyId, options);
  const response = await apiFetch<PaginatedResponse<Tag>>(url, { method: method });

  return {
    tags: response.payload.data,
    pagination: response.payload.pagination,
  };
}
