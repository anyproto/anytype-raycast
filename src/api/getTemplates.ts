import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { Template, PaginatedResponse } from "../utils/schemas";
import { Pagination } from "../utils/schemas";
import { encodeQueryParams } from "../utils/helpers";

export async function getTemplates(
  spaceId: string,
  typeId: string,
  options: {
    offset: number;
    limit: number;
  },
): Promise<{
  templates: Template[];
  pagination: Pagination;
}> {
  const queryString = encodeQueryParams(options);
  const response = await fetch(
    `${API_URL}/spaces/${spaceId}/objectTypes/${typeId}/templates${queryString}`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch templates for space ${spaceId} and type ${typeId}: [${response.status}] ${response.statusText}`,
    );
  }

  const jsonResponse = (await response.json()) as PaginatedResponse<Template>;

  return {
    templates: jsonResponse.data ? jsonResponse.data : [],
    pagination: jsonResponse.pagination,
  };
}
