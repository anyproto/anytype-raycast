import { useCachedPromise } from "@raycast/utils";
import { getObjectsForSpace } from "../api/getObjectsForSpace";

export function useObjectsForSpace(spaceId: string) {
  const { data, error, isLoading } = useCachedPromise(getObjectsForSpace, [
    spaceId,
  ]);

  return {
    objects: data?.objects,
    objectsError: error,
    isLoadingObjects: isLoading,
  };
}
