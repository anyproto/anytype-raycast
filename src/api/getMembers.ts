import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constants";
import { PaginatedResponse } from "../utils/schemas";
import { transformMembers } from "../utils/helpers";
import { Member, Pagination } from "../utils/schemas";

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
    members: response.data ? await transformMembers(response.data) : [],
    pagination: response.pagination,
  };
}
