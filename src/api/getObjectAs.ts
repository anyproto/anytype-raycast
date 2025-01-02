import { apiFetch } from "../utils/api";
import { API_URL } from "../utils/constants";
import { ObjectAs } from "../utils/schemas";

export async function getObjectAs(
  spaceId: string,
  objectId: string,
  format: string,
): Promise<{
  objectAs: ObjectAs;
}> {
  const url = `${API_URL}/spaces/${spaceId}/objects/${objectId}/export/${format}`;

  const response = await apiFetch<ObjectAs>(url, { method: "GET" });

  return {
    objectAs: response,
  };
}
