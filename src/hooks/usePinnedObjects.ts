import { useCachedPromise } from "@raycast/utils";
import { getObject } from "../api/getObject";
import { getPinnedObjects } from "../helpers/localStorageHelper";

export function usePinnedObjects() {
  const { data, error, isLoading, mutate } = useCachedPromise(
    async () => {
      const pinnedObjects = await getPinnedObjects();
      const objects = await Promise.all(
        pinnedObjects.map(async ({ spaceId, objectId }) => {
          const response = await getObject(spaceId, objectId);
          return response.object;
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
