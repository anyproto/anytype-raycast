import { useCachedPromise } from "@raycast/utils";
import { getObjects } from "../api/getObjects";

export function useObjects(spaceId: string) {
  const { data, error, isLoading } = useCachedPromise(getObjects, [spaceId]);

  return {
    objects: data?.objects,
    objectsError: error,
    isLoadingObjects: isLoading,
  };
}
