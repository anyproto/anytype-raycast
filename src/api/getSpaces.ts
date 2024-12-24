import fetch from "node-fetch";
import { API_URL } from "../utils/constants";
import { SpaceResponse } from "../utils/schemas";
import { transformSpace } from "../utils/helpers";
import { Space, Pagination } from "../utils/schemas";

export async function getSpaces(): Promise<{
  spaces: Space[];
  pagination: Pagination;
}> {
  const response = await fetch(`${API_URL}/spaces`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch spaces: [${response.status}] ${response.statusText}`,
    );
  }
  const data = (await response.json()) as SpaceResponse;

  const spaces = data.spaces ? await transformSpace(data.spaces) : [];
  const pagination = data.pagination;

  return { spaces, pagination };
}
