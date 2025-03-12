import { mapType } from "../mappers/types";
import { DisplayType, Type } from "../models";
import { apiEndpoints, apiFetch, ErrorWithStatus } from "../utils";

export async function getType(
  spaceId: string,
  typeId: string,
): Promise<{
  type: DisplayType | null;
}> {
  const { url, method } = apiEndpoints.getType(spaceId, typeId);
  try {
    const response = await apiFetch<{ type: Type }>(url, { method: method });
    return {
      type: response ? await mapType(response.payload.type) : null,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      (error as ErrorWithStatus).status = 404;
    }
    throw error;
  }
}
