import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { Type, TypesResponse } from "../utils/schemas";
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

  const data = (await response.json()) as TypesResponse;
  const types = data.object_types
    ? await transformTypes(data.object_types)
    : [];
  const pagination = data.pagination;

  return { types, pagination };
}
