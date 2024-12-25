import fetch from "node-fetch";
import { API_URL } from "../utils/constants";

export async function createSpace(objectData: { name: string }): Promise<void> {
  const response = await fetch(`${API_URL}/spaces`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: objectData.name }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create space: [${response.status}] ${response.statusText}`,
    );
  }
}
