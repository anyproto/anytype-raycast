import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constant";
import { ErrorWithStatus } from "../helpers/error";
import { DisplayType, Type } from "../helpers/schema";
import { mapType } from "../mappers/types";

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
