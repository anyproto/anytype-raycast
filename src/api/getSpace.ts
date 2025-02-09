import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constants";
import { Space } from "../helpers/schemas";
import { mapSpace } from "../mappers/spaces";

export async function getSpace(spaceId: string): Promise<{
  space: Space | null;
}> {
  const { url, method } = apiEndpoints.getSpace(spaceId);
  try {
    const response = await apiFetch<{ space: Space }>(url, { method: method });
    return {
      space: response ? await mapSpace(response.space) : null,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return {
        space: null,
      };
    }
    throw error;
  }
}
