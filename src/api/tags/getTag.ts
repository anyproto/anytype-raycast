import { mapTag } from "../../mappers/properties";
import { Tag } from "../../models";
import { apiEndpoints, apiFetch } from "../../utils";

export async function getTag(spaceId: string, propertyId: string, tagId: string): Promise<{ tag: Tag }> {
  const { url, method } = apiEndpoints.getTag(spaceId, propertyId, tagId);
  const response = await apiFetch<{ tag: Tag }>(url, { method: method });
  return {
    tag: mapTag(response.payload.tag),
  };
}
