import { useCachedPromise } from "@raycast/utils";
import { getObjects } from "../api/getObjects";

export function useObjects(searchText: string, type: string) {
  const { data, error, isLoading } = useCachedPromise(getObjects, [
    searchText,
    type,
  ]);

  return {
    objects: data?.objects,
    objectsError: error,
    isLoadingObjects: isLoading,
  };
}
