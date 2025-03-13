import { mapType } from "../mappers/types";
import { RawType, Type } from "../models";
import { apiEndpoints, apiFetch, ErrorWithStatus } from "../utils";

export async function getType(
  spaceId: string,
  typeId: string,
): Promise<{
  type: Type | null;
}> {
  const { url, method } = apiEndpoints.getType(spaceId, typeId);
  try {
    const response = await apiFetch<{ type: RawType }>(url, { method: method });
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
