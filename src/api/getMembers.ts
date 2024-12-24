import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { MemberResponse } from "../utils/schemas";
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
  const data = (await response.json()) as MemberResponse;

  const members = data.members ? await transformMembers(data.members) : [];
  const pagination = data.pagination;

  return { members, pagination };
}
