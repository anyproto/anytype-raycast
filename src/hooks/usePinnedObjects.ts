import { useCachedPromise } from "@raycast/utils";
import { getObject } from "../api/getObject";
import { getPinnedObjects, removePinnedObject } from "../helpers/localStorage";

export function usePinnedObjects() {
  const { data, error, isLoading, mutate } = useCachedPromise(
    async () => {
      const pinnedObjects = await getPinnedObjects();
      const objects = await Promise.all(
        pinnedObjects.map(async ({ spaceId, objectId }) => {
          try {
            const response = await getObject(spaceId, objectId);
            return response.object;
          } catch (error) {
            const typedError = error as Error & { status?: number };
            if (typedError.status === 404) {
              await removePinnedObject(spaceId, objectId);
            }
            return null;
          }
        }),
      );
      return objects.filter((object) => object !== null);
    },
    [],
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
