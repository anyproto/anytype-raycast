import fetch from "node-fetch";
import { API_URL } from "../utils/constants";

export async function createObject(
  spaceId: string,
  objectData: {
    icon: string;
    name: string;
    template_id: string;
    object_type_unique_key: string;
  },
): Promise<void> {
  const response = await fetch(`${API_URL}/spaces/${spaceId}/objects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(objectData),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create object in space ${spaceId}: [${response.status}] ${response.statusText}`,
    );
  }
}
