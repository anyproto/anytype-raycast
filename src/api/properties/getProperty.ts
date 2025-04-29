import { mapProperty } from "../../mappers/properties";
import { Property } from "../../models";
import { apiEndpoints, apiFetch } from "../../utils";

export async function getProperty(spaceId: string, propertyId: string): Promise<{ property: Property }> {
  const { url, method } = apiEndpoints.getProperty(spaceId, propertyId);
  const response = await apiFetch<{ property: Property }>(url, { method: method });
  return {
    property: mapProperty(response.payload.property),
  };
}
