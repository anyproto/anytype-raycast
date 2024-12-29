import { useCachedPromise } from "@raycast/utils";
import { search } from "../api/search";

export function useSearch(searchText: string, type: string) {
  const { data, error, isLoading } = useCachedPromise(search, [
    searchText,
    type,
  ]);

  return {
    objects: data?.objects,
    objectsError: error,
    isLoadingObjects: isLoading,
  };
}
