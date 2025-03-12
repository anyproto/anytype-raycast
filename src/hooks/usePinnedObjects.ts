import { MutatePromise, useCachedPromise } from "@raycast/utils";
import { getObject } from "../api";
import { DisplayMember, DisplayObject, DisplayType } from "../models";
import { getPinned, removePinned } from "../utils";

export function usePinnedObjects(spaceId: string) {
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
