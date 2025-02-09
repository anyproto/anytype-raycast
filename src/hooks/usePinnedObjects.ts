import { useCachedPromise } from "@raycast/utils";
import { getMember } from "../api/getMember";
import { getObject } from "../api/getObject";
import { getType } from "../api/getType";
import { getPinned, removePinned } from "../helpers/storage";

export function usePinnedObjects(spaceId: string) {
  const { data, error, isLoading, mutate } = useCachedPromise(
    async (spaceId) => {
      const pinnedObjects = await getPinned(spaceId);
      const objects = await Promise.all(
        pinnedObjects.map(async ({ spaceId, objectId }) => {
          try {
            const response = await getObject(spaceId, objectId);
            return response.object;
          } catch (error) {
            const typedError = error as Error & { status?: number };
            if (typedError.status === 404) {
              await removePinned(spaceId, objectId, spaceId);
            }
            return null;
          }
        }),
      );
      return objects.filter((object) => object !== null);
    },
    [spaceId],
    {
      keepPreviousData: true,
    },
  );

  return {
    pinnedObjects: data,
    pinnedObjectsError: error,
    isLoadingPinnedObjects: isLoading,
    mutatePinnedObjects: mutate,
  };
}

export function usePinnedTypes(spaceId: string) {
  const { data, error, isLoading, mutate } = useCachedPromise(
    async (spaceId) => {
      const pinnedObjects = await getPinned(spaceId);
      const types = await Promise.all(
        pinnedObjects.map(async ({ spaceId, objectId }) => {
          try {
            const response = await getType(spaceId, objectId);
            return response.type;
          } catch (error) {
            const typedError = error as Error & { status?: number };
            if (typedError.status === 404) {
              await removePinned(spaceId, objectId, spaceId);
            }
            return null;
          }
        }),
      );
      return types.filter((type) => type !== null);
    },
    [spaceId],
    {
      keepPreviousData: true,
    },
  );

  return {
    pinnedTypes: data,
    pinnedTypesError: error,
    isLoadingPinnedTypes: isLoading,
    mutatePinnedTypes: mutate,
  };
}

export function usePinnedMembers(spaceId: string) {
  const { data, error, isLoading, mutate } = useCachedPromise(
    async (spaceId) => {
      const pinnedObjects = await getPinned(spaceId);
      const members = await Promise.all(
        pinnedObjects.map(async ({ spaceId, objectId }) => {
          try {
            const response = await getMember(spaceId, objectId);
            return response.member;
          } catch (error) {
            const typedError = error as Error & { status?: number };
            if (typedError.status === 404) {
              await removePinned(spaceId, objectId, spaceId);
            }
            return null;
          }
        }),
      );
      return members.filter((member) => member !== null);
    },
    [spaceId],
    {
      keepPreviousData: true,
    },
  );

  return {
    pinnedMembers: data,
    pinnedMembersError: error,
    isLoadingPinnedMembers: isLoading,
    mutatePinnedMembers: mutate,
  };
}
