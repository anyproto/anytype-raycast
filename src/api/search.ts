import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { SpaceObject, PaginatedResponse } from "../utils/schemas";
import { transformObjects } from "../utils/helpers";
import { encodeQueryParams } from "../utils/helpers";

export async function search(
  searchText: string,
  type: string,
  options: { offset: number; limit: number },
): Promise<PaginatedResponse<SpaceObject>> {
  const queryString = encodeQueryParams({
    query: searchText,
    type: type,
    offset: options.offset,
    limit: options.limit,
  });

  const response = await fetch(`${API_URL}/search${queryString}`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch objects: [${response.status}] ${response.statusText}`,
    );
  }

  const jsonResponse =
    (await response.json()) as PaginatedResponse<SpaceObject>;
  return {
    data: jsonResponse.data ? await transformObjects(jsonResponse.data) : [],
    pagination: jsonResponse.pagination,
  };
}
