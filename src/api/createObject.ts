import { apiFetch } from "../utils/api";
import { API_URL } from "../utils/constants";

export async function createObject(
  spaceId: string,
  objectData: {
    icon: string;
    name: string;
    description: string;
    body: string;
    source: string;
    template_id: string;
    object_type_unique_key: string;
  },
): Promise<void> {
  const url = `${API_URL}/spaces/${spaceId}/objects`;

  await apiFetch(url, {
    method: "POST",
    body: JSON.stringify(objectData),
  });
}
