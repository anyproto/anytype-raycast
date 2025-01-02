import { apiFetch } from "../utils/api";
import { API_URL } from "../utils/constants";
import { PaginatedResponse } from "../utils/schemas";
import { transformMembers } from "../utils/helpers";
import { Member, Pagination } from "../utils/schemas";
import { encodeQueryParams } from "../utils/helpers";

export async function getMembers(
  spaceId: string,
  options: { offset: number; limit: number },
): Promise<{
  members: Member[];
  pagination: Pagination;
}> {
  const queryString = encodeQueryParams(options);
  const url = `${API_URL}/spaces/${spaceId}/members${queryString}`;

  const response = await apiFetch<PaginatedResponse<Member>>(url, { method: "GET" });

  return {
    members: response.data ? await transformMembers(response.data) : [],
    pagination: response.pagination,
  };
}
