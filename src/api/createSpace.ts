import { apiFetch } from "./apiClient";
import { API_URL } from "../utils/constants";

export async function createSpace(objectData: { name: string }): Promise<void> {
  const url = `${API_URL}/spaces`;

  await apiFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: objectData.name }),
  });
}
