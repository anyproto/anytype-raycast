import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { SpaceObject, Pagination, ObjectResponse } from "../utils/schemas";
import { transformObjects } from "../utils/helpers";

export async function getObjects(
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
  const response = await fetch(`${API_URL}/objects${queryString}`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch objects: [${response.status}] ${response.statusText}`,
    );
  }
  const data = (await response.json()) as ObjectResponse;
  const objects = data.objects ? await transformObjects(data.objects) : [];
  const pagination = data.pagination;

  return { objects, pagination };
}
