import fetch from "node-fetch";
import { useCachedPromise } from "@raycast/utils";
import { UseCachedPromiseReturnType } from "@raycast/utils/dist/types";
import * as C from "../utils/constants";
import * as S from "../utils/schemas";
import * as H from "../utils/helpers";

/********************************
 * Search
 * GET /objects
 ********************************/

export function useGetObjects(searchText: string, type: string) {
  return useCachedPromise(
    async ({ signal }) => {
      const queryParams = [];
      if (searchText) {
        queryParams.push(`search=${encodeURIComponent(searchText)}`);
      }
      if (type) {
        queryParams.push(`type=${encodeURIComponent(type)}`);
      }
      const queryString =
        queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
      const response = await fetch(`${C.API_URL}/objects${queryString}`, {
        signal,
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch objects: [${response.status}] ${response.statusText}`,
        );
      }
      const data = (await response.json()) as { objects: S.SpaceObject[] };
      return data.objects ? H.transformObjects(data.objects) : [];
    },
    [searchText],
    // TODO figure out cachedPromise with type as second dependency
    // [searchText, type],
  ) as UseCachedPromiseReturnType<S.SpaceObject[], undefined>;
}

/********************************
 * Spaces
 * GET /spaces
 * POST /spaces
 * GET /spaces/:spaceId/members
 ********************************/

export function useGetSpaces() {
  return useCachedPromise(async () => {
    const response = await fetch(`${C.API_URL}/spaces`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch spaces: [${response.status}] ${response.statusText}`,
      );
    }
    const data = (await response.json()) as { spaces: S.Space[] };
    return data.spaces ? H.transformSpace(data.spaces) : [];
  }, []) as UseCachedPromiseReturnType<S.Space[], undefined>;
}

export async function createSpace(objectData: { name: string }): Promise<void> {
  const response = await fetch(`${C.API_URL}/spaces`, {
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

export function useGetSpaceMembers(spaceId: string) {
  return useCachedPromise(
    async ({ signal }) => {
      const response = await fetch(`${C.API_URL}/spaces/${spaceId}/members`, {
        signal,
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch space members: [${response.status}] ${response.statusText}`,
        );
      }
      const data = (await response.json()) as { members: S.SpaceMember[] };
      return data.members ? H.transformSpaceMembers(data.members) : [];
    },
    [spaceId],
  ) as UseCachedPromiseReturnType<S.SpaceMember[], undefined>;
}

/********************************
 * SpaceObjects
 * GET /spaces/:spaceId/objects
 * POST /spaces/:spaceId/objects
 ********************************/

export function useGetObjectsForSpace(spaceId: string) {
  return useCachedPromise(
    async ({ signal }) => {
      const response = await fetch(`${C.API_URL}/spaces/${spaceId}/objects`, {
        signal,
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch objects for space ${spaceId}: [${response.status}] ${response.statusText}`,
        );
      }
      const data = (await response.json()) as { objects: S.SpaceObject[] };
      return data.objects ? H.transformObjects(data.objects) : [];
    },
    [spaceId],
  ) as UseCachedPromiseReturnType<S.SpaceObject[], undefined>;
}

export async function createObject(
  spaceId: string,
  objectData: {
    icon: string;
    name: string;
    template_id: string;
    object_type_unique_key: string;
  },
): Promise<void> {
  const response = await fetch(`${C.API_URL}/spaces/${spaceId}/objects`, {
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

/********************************
 * Types and Templates
 * GET /spaces/:spaceId/objectTypes
 * GET /spaces/:spaceId/objectTypes/:typeId/templates
 ********************************/

export function useGetObjectTypes(spaceId: string) {
  return useCachedPromise(
    async ({ signal }) => {
      const response = await fetch(
        `${C.API_URL}/spaces/${spaceId}/objectTypes?limit=100&offset=0`,
        { signal },
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch object types for space ${spaceId}: [${response.status}] ${response.statusText}`,
        );
      }
      const data = (await response.json()) as { objectTypes: S.ObjectType[] };
      return data.objectTypes ? H.transformObjectTypes(data.objectTypes) : [];
    },
    [spaceId],
  ) as UseCachedPromiseReturnType<S.ObjectType[], undefined>;
}

export function useGetTemplates(spaceId: string, typeId: string) {
  return useCachedPromise(
    async ({ signal }) => {
      const response = await fetch(
        `${C.API_URL}/spaces/${spaceId}/objectTypes/${typeId}/templates`,
        { signal },
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch templates for type ${typeId} in space ${spaceId}: [${response.status}] ${response.statusText}`,
        );
      }
      const data = (await response.json()) as { templates: S.ObjectTemplate[] };
      return data.templates ? data.templates : [];
    },
    [spaceId],
    // TODO figure out cachedPromise with typeId as second dependency
    // [spaceId, typeId],
  ) as UseCachedPromiseReturnType<S.ObjectTemplate[], undefined>;
}

/********************************
 * Chat
 * GET /spaces/:spaceId/chat/messages
 * POST /spaces/:spaceId/chat/messages
 ********************************/

export function useGetChatMessages(spaceId: string) {
  return useCachedPromise(
    async ({ signal }) => {
      const response = await fetch(
        `${C.API_URL}/spaces/${spaceId}/chat/messages`,
        { signal },
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch chat messages for space ${spaceId}: [${response.status}] ${response.statusText}`,
        );
      }
      const data = (await response.json()) as {
        chatId: string;
        messages: S.ChatMessage[];
      };
      return {
        chatId: data.chatId,
        messages: data.messages ?? [],
      };
    },
    [spaceId],
  ) as UseCachedPromiseReturnType<
    { chatId: string; messages: S.ChatMessage[] },
    undefined
  >;
}

export async function createChatMessage(
  spaceId: string,
  messageText: string,
): Promise<void> {
  const response = await fetch(`${C.API_URL}/spaces/${spaceId}/chat/messages`, {
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
