import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { transformObjects } from "../utils/helpers";
import { PaginatedResponse, Pagination, SpaceObject } from "../utils/schemas";
import { encodeQueryParams } from "../utils/helpers";

export async function getObjects(
  spaceId: string,
  options: { offset: number; limit: number },
): Promise<{
  objects: SpaceObject[];
  pagination: Pagination;
}> {
  const queryString = encodeQueryParams(options);

  const response = await fetch(
    `${API_URL}/spaces/${spaceId}/objects${queryString}`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch objects for space ${spaceId}: [${response.status}] ${response.statusText}`,
    );
  }

  const jsonResponse =
    (await response.json()) as PaginatedResponse<SpaceObject>;

  return {
    objects: jsonResponse.data ? await transformObjects(jsonResponse.data) : [],
    pagination: jsonResponse.pagination,
  };
}
