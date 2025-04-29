import { mapProperty } from "../../mappers/properties";
import { Property, UpdatePropertyRequest } from "../../models";
import { apiEndpoints, apiFetch } from "../../utils";

export async function updateProperty(
  spaceId: string,
  propertyId: string,
  data: UpdatePropertyRequest,
): Promise<{
  property: Property | null;
}> {
  const { url, method } = apiEndpoints.updateProperty(spaceId, propertyId);

  const response = await apiFetch<{ property: Property }>(url, {
    method: method,
    body: JSON.stringify(data),
  });

  return {
    property: response ? mapProperty(response.payload.property) : null,
  };
}
