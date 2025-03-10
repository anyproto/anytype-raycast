import { MutatePromise, useCachedPromise } from "@raycast/utils";
import { getMember } from "../api/getMember";
import { getObject } from "../api/getObject";
import { getType } from "../api/getType";
import { DisplayMember, DisplayObject, DisplayType } from "../helpers/schemas";
import { getPinned, removePinned } from "../helpers/storage";

export function usePinnedObjects(spaceId: string): {
  pinnedObjects: DisplayObject[];
  pinnedObjectsError: Error | undefined;
  isLoadingPinnedObjects: boolean;
  mutatePinnedObjects: MutatePromise<DisplayObject[] | DisplayType[] | DisplayMember[]>;
} {
  const { data, error, isLoading, mutate } = useCachedPromise(
    async (spaceId) => {
      const pinnedObjects = await getPinned(spaceId);
      const objects = await Promise.all(
        pinnedObjects.map(async (pinned) => {
          try {
            const response = await getObject(pinned.spaceId, pinned.objectId);
            return response.object;
          } catch (error) {
            const typedError = error as Error & { status?: number };
            if (typedError.status === 404) {
              await removePinned(pinned.spaceId, pinned.objectId, spaceId);
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
    pinnedObjects: data as DisplayObject[],
    pinnedObjectsError: error,
    isLoadingPinnedObjects: isLoading,
    mutatePinnedObjects: mutate as MutatePromise<DisplayObject[] | DisplayType[] | DisplayMember[]>,
  };
}

export function usePinnedTypes(spaceId: string) {
  const { data, error, isLoading, mutate } = useCachedPromise(
    async (spaceId) => {
      const pinnedTypes = await getPinned(spaceId);
      const types = await Promise.all(
        pinnedTypes.map(async (pinned) => {
          try {
            const response = await getType(pinned.spaceId, pinned.objectId);
            return response.type;
          } catch (error) {
            const typedError = error as Error & { status?: number };
            if (typedError.status === 404) {
              await removePinned(pinned.spaceId, pinned.objectId, spaceId);
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
      const pinnedMembers = await getPinned(spaceId);
      const members = await Promise.all(
        pinnedMembers.map(async (pinned) => {
          try {
            const response = await getMember(pinned.spaceId, pinned.objectId);
            return response.member;
          } catch (error) {
            const typedError = error as Error & { status?: number };
            if (typedError.status === 404) {
              await removePinned(pinned.spaceId, pinned.objectId, spaceId);
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
