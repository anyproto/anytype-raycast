import { mapMembers } from "../mappers/members";
import { DisplayMember, Member, PaginatedResponse, Pagination } from "../models";
import { apiEndpoints, apiFetch } from "../utils";

export async function getMembers(
  spaceId: string,
  options: { offset: number; limit: number },
): Promise<{
  members: DisplayMember[];
  pagination: Pagination;
}> {
  const { url, method } = apiEndpoints.getMembers(spaceId, options);
  const response = await apiFetch<PaginatedResponse<Member>>(url, { method: method });

  return {
    members: response.payload.data ? await mapMembers(response.payload.data) : [],
    pagination: response.payload.pagination,
  };
}
