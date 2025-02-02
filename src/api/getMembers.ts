import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constants";
import { Member, PaginatedResponse, Pagination } from "../helpers/schemas";
import { mapMembers } from "../mappers/members";

export async function getMembers(
  spaceId: string,
  options: { offset: number; limit: number },
): Promise<{
  members: Member[];
  pagination: Pagination;
}> {
  const { url, method } = apiEndpoints.getMembers(spaceId, options);
  const response = await apiFetch<PaginatedResponse<Member>>(url, { method: method });

  return {
    members: response.data ? await mapMembers(response.data) : [],
    pagination: response.pagination,
  };
}
