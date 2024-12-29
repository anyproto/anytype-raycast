import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { PaginatedResponse } from "../utils/schemas";
import { transformSpace } from "../utils/helpers";
import { Space, Pagination } from "../utils/schemas";

export async function getSpaces(): Promise<{
  spaces: Space[];
  pagination: Pagination;
}> {
  const response = await fetch(`${API_URL}/spaces`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch spaces: [${response.status}] ${response.statusText}`,
    );
  }

  const jsonResponse = (await response.json()) as PaginatedResponse<Space>;
  const spaces = jsonResponse.data
    ? await transformSpace(jsonResponse.data)
    : [];
  const pagination = jsonResponse.pagination;

  return { spaces, pagination };
}
