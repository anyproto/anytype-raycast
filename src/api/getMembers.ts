import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { PaginatedResponse } from "../utils/schemas";
import { transformMembers } from "../utils/helpers";
import { Member, Pagination } from "../utils/schemas";

export async function getMembers(spaceId: string): Promise<{
  members: Member[];
  pagination: Pagination;
}> {
  const response = await fetch(`${API_URL}/spaces/${spaceId}/members`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch members for space ${spaceId}: [${response.status}] ${response.statusText}`,
    );
  }

  const jsonResponse = (await response.json()) as PaginatedResponse<Member>;
  const members = jsonResponse.data
    ? await transformMembers(jsonResponse.data)
    : [];
  const pagination = jsonResponse.pagination;

  return { members, pagination };
}
