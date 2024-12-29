import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { Type, PaginatedResponse } from "../utils/schemas";
import { transformTypes } from "../utils/helpers";
import { Pagination } from "../utils/schemas";
import { encodeQueryParams } from "../utils/helpers";

export async function getTypes(
  spaceId: string,
  options: {
    offset: number;
    limit: number;
  },
): Promise<{
  types: Type[];
  pagination: Pagination;
}> {
  const queryString = encodeQueryParams(options);
  const response = await fetch(
    `${API_URL}/spaces/${spaceId}/objectTypes${queryString}`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch types for space ${spaceId}: [${response.status}] ${response.statusText}`,
    );
  }

  const jsonResponse = (await response.json()) as PaginatedResponse<Type>;

  return {
    types: jsonResponse.data ? await transformTypes(jsonResponse.data) : [],
    pagination: jsonResponse.pagination,
  };
}
