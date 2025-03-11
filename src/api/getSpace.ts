import { mapSpace } from "../mappers/spaces";
import { DisplaySpace, Space } from "../models";
import { apiFetch } from "../utils/api";
import { apiEndpoints } from "../utils/constant";
import { ErrorWithStatus } from "../utils/error";

export async function getSpace(spaceId: string): Promise<{
  space: DisplaySpace | null;
}> {
  const { url, method } = apiEndpoints.getSpace(spaceId);
  try {
    const response = await apiFetch<{ space: Space }>(url, { method: method });
    return {
      space: response ? await mapSpace(response.payload.space) : null,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      (error as ErrorWithStatus).status = 404;
    }
    throw error;
  }
}
