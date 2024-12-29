import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { PaginatedResponse } from "../utils/schemas";
import { transformSpace } from "../utils/helpers";
import { Space, Pagination } from "../utils/schemas";
import { encodeQueryParams } from "../utils/helpers";

export async function getSpaces(options: {
  offset: number;
  limit: number;
}): Promise<{
  spaces: Space[];
  pagination: Pagination;
}> {
  const queryParams = encodeQueryParams(options);
  const response = await fetch(`${API_URL}/spaces${queryParams}`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch spaces: [${response.status}] ${response.statusText}`,
    );
  }

  const jsonResponse = (await response.json()) as PaginatedResponse<Space>;

  return {
    spaces: jsonResponse.data ? await transformSpace(jsonResponse.data) : [],
    pagination: jsonResponse.pagination,
  };
}
