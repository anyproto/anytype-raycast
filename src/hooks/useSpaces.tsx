import { useCachedPromise } from "@raycast/utils";
import { getSpaces } from "../api/getSpaces";

export function useSpaces() {
  const { data, error, isLoading } = useCachedPromise(getSpaces, []);

  return {
    spaces: data?.spaces,
    spacesError: error,
    isLoadingSpaces: isLoading,
  };
}
