import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constants";
import { ErrorWithStatus } from "../helpers/errors";
import { DisplaySpace, Space } from "../helpers/schemas";
import { mapSpace } from "../mappers/spaces";

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
