import fetch from "node-fetch";
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

  const response = await fetch(
    `${API_URL}/spaces/${spaceId}/members${queryString}`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch members for space ${spaceId}: [${response.status}] ${response.statusText}`,
    );
  }

  const jsonResponse = (await response.json()) as PaginatedResponse<Member>;

  return {
    members: jsonResponse.data ? await transformMembers(jsonResponse.data) : [],
    pagination: jsonResponse.pagination,
  };
}
