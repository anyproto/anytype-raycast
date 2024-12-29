import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { Template, PaginatedResponse } from "../utils/schemas";
import { Pagination } from "../utils/schemas";

export async function getTemplates(
  spaceId: string,
  typeId: string,
): Promise<{
  templates: Template[];
  pagination: Pagination;
}> {
  const response = await fetch(
    `${API_URL}/spaces/${spaceId}/objectTypes/${typeId}/templates`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch templates: [${response.status}] ${response.statusText}`,
    );
  }

  const jsonResponse = (await response.json()) as PaginatedResponse<Template>;
  const templates = jsonResponse.data ? jsonResponse.data : [];
  const pagination = jsonResponse.pagination;

  return { templates, pagination };
}
