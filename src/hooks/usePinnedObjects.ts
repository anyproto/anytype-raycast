import { MutatePromise, useCachedPromise } from "@raycast/utils";
import { getObject } from "../api";
import { BodyFormat, Member, Property, SpaceObject, Type } from "../models";
import { errorConnectionMessage, ErrorWithStatus, getPinned, removePinned, useAuthTs } from "../utils";

export function usePinnedObjects(key: string) {
  const authTs = useAuthTs();

  const { data, error, isLoading, mutate } = useCachedPromise(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (key, authTs) => {
      const pinnedObjects = await getPinned(key);
      const objects = await Promise.all(
        pinnedObjects.map(async (pinned) => {
          try {
            const response = await getObject(pinned.spaceId, pinned.objectId, BodyFormat.Markdown);
            if (response.object.archived) {
              await removePinned(pinned.spaceId, pinned.objectId, key);
              return null;
            }
            return response.object as SpaceObject;
          } catch (error) {
            const typedError = error as ErrorWithStatus;
            if (typedError.message === errorConnectionMessage) {
              throw error;
            } else if (typedError.status === 404 || typedError.status === 410) {
              await removePinned(pinned.spaceId, pinned.objectId, key);
            }
            return null;
          }
        }),
      );
      return objects.filter((object) => object !== null);
    },
    [key, authTs],
    {
      keepPreviousData: true,
    },
  );

  return {
    pinnedObjects: data as SpaceObject[],
    pinnedObjectsError: error,
    isLoadingPinnedObjects: isLoading,
    mutatePinnedObjects: mutate as MutatePromise<SpaceObject[] | Type[] | Property[] | Member[]>,
  };
}
