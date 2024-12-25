import fetch from "node-fetch";
import { useCachedPromise } from "@raycast/utils";
import { UseCachedPromiseReturnType } from "@raycast/utils/dist/types";
import { API_URL } from "../utils/constants";
import { ChatMessage } from "../utils/schemas";

/********************************
 * Chat
 * GET /spaces/:spaceId/chat/messages
 * POST /spaces/:spaceId/chat/messages
 ********************************/

export function useGetChatMessages(spaceId: string) {
  return useCachedPromise(
    async ({ signal }) => {
      const response = await fetch(
        `${API_URL}/spaces/${spaceId}/chat/messages`,
        { signal },
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch chat messages for space ${spaceId}: [${response.status}] ${response.statusText}`,
        );
      }
      const data = (await response.json()) as {
        chatId: string;
        messages: ChatMessage[];
      };
      return {
        chatId: data.chatId,
        messages: data.messages ?? [],
      };
    },
    [spaceId],
  ) as UseCachedPromiseReturnType<
    { chatId: string; messages: ChatMessage[] },
    undefined
  >;
}

export async function createChatMessage(
  spaceId: string,
  messageText: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/spaces/${spaceId}/chat/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: messageText }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to post chat message to space ${spaceId}: [${response.status}] ${response.statusText}`,
    );
  }
}
