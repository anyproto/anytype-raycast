import { useCachedPromise } from "@raycast/utils";
import { getObject } from "../api/getObject";
import { getPinnedObjects, removePinnedObject } from "../helpers/localStorage";

export function usePinnedObjects(spaceId: string) {
  const { data, error, isLoading, mutate } = useCachedPromise(
    async (spaceId) => {
      const pinnedObjects = await getPinnedObjects(spaceId);
      const objects = await Promise.all(
        pinnedObjects.map(async ({ spaceId, objectId }) => {
          try {
            const response = await getObject(spaceId, objectId);
            return response.object;
          } catch (error) {
            const typedError = error as Error & { status?: number };
            if (typedError.status === 404) {
              await removePinnedObject(spaceId, objectId, spaceId);
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
