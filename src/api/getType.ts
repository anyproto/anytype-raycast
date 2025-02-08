import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constants";
import { Type } from "../helpers/schemas";
import { mapType } from "../mappers/types";

export async function getType(
  spaceId: string,
  type_id: string,
): Promise<{
  type: Type | null;
}> {
  const { url, method } = apiEndpoints.getType(spaceId, type_id);
  try {
    const response = await apiFetch<{ type: Type }>(url, { method: method });
    return {
      type: response ? await mapType(response.type) : null,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return {
        type: null,
      };
    }
    throw error;
  }
}
