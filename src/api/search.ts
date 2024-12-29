import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { SpaceObject, PaginatedResponse } from "../utils/schemas";
import { transformObjects } from "../utils/helpers";

export async function search(
  searchText: string,
  type: string,
  options: { offset: number; limit: number },
): Promise<PaginatedResponse<SpaceObject>> {
  const queryParams = [];
  if (searchText) {
    queryParams.push(`search=${encodeURIComponent(searchText)}`);
  }
  if (type) {
    queryParams.push(`type=${encodeURIComponent(type)}`);
  }
  if (options.offset !== undefined) {
    queryParams.push(`offset=${options.offset}`);
  }
  if (options.limit !== undefined) {
    queryParams.push(`limit=${options.limit}`);
  }
  const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

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
