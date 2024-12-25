import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { Template, TemplatesResponse } from "../utils/schemas";
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

  const data = (await response.json()) as TemplatesResponse;
  const templates = data.templates ? data.templates : [];
  const pagination = data.pagination;

  return { templates, pagination };
}
