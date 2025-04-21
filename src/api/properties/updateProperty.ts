import { mapProperty } from "../../mappers/properties";
import { Property, RawProperty, UpdatePropertyRequest } from "../../models";
import { apiEndpoints, apiFetch } from "../../utils";

export async function updateProperty(
  spaceId: string,
  propertyId: string,
  data: UpdatePropertyRequest,
): Promise<{
  member: Property | null;
}> {
  const { url, method } = apiEndpoints.updateProperty(spaceId, propertyId);

  const response = await apiFetch<{ member: RawProperty }>(url, {
    method: method,
    body: JSON.stringify(data),
  });

  return {
    member: response ? mapProperty(response.payload.member) : null,
  };
}
