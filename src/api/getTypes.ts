import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { Type, PaginatedResponse } from "../utils/schemas";
import { transformTypes } from "../utils/helpers";
import { Pagination } from "../utils/schemas";

export async function getTypes(spaceId: string): Promise<{
  types: Type[];
  pagination: Pagination;
}> {
  const response = await fetch(`${API_URL}/spaces/${spaceId}/objectTypes`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch spaces: [${response.status}] ${response.statusText}`,
    );
  }

  const jsonResponse = (await response.json()) as PaginatedResponse<Type>;
  const types = jsonResponse.data
    ? await transformTypes(jsonResponse.data)
    : [];
  const pagination = jsonResponse.pagination;

  return { types, pagination };
}
