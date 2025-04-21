import { mapProperty } from "../../mappers/properties";
import { Property, RawProperty } from "../../models";
import { apiEndpoints, apiFetch } from "../../utils";

export async function deleteProperty(spaceId: string, objectId: string): Promise<Property | null> {
  const { url, method } = apiEndpoints.deleteProperty(spaceId, objectId);

  const response = await apiFetch<{ property: RawProperty }>(url, {
    method: method,
  });

  return response ? mapProperty(response.payload.property) : null;
}
