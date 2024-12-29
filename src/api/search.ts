import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { SpaceObject, Pagination, PaginatedResponse } from "../utils/schemas";
import { transformObjects } from "../utils/helpers";

export async function search(
  searchText: string,
  type: string,
): Promise<{
  objects: SpaceObject[];
  pagination: Pagination;
}> {
  const queryParams = [];
  if (searchText) {
    queryParams.push(`search=${encodeURIComponent(searchText)}`);
  }
  if (type) {
    queryParams.push(`type=${encodeURIComponent(type)}`);
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
  const objects = jsonResponse.data
    ? await transformObjects(jsonResponse.data)
    : [];
  const pagination = jsonResponse.pagination;

  return { objects, pagination };
}
