import { useCachedPromise } from "@raycast/utils";
import { getSpace } from "../api/getSpace";
import { localStorageKeys } from "../helpers/constants";
import { getPinned, removePinned } from "../helpers/storage";

export function usePinnedSpaces() {
  const { data, error, isLoading, mutate } = useCachedPromise(
    async () => {
      const pinnedSpaces = await getPinned(localStorageKeys.suffixForSpaces);
      const spaces = await Promise.all(
        pinnedSpaces.map(async ({ spaceId, objectId }) => {
          try {
            const response = await getSpace(spaceId);
            return response.space;
          } catch (error) {
            const typedError = error as Error & { status?: number };
            if (typedError.status === 404) {
              await removePinned(spaceId, objectId, spaceId);
            }
            return null;
          }
        }),
      );
      return spaces.filter((object) => object !== null);
    },
    [],
    {
      keepPreviousData: true,
      initialData: [],
    },
  );

  return {
    pinnedSpaces: data,
    pinnedSpacesError: error,
    isLoadingPinnedSpaces: isLoading,
    mutatePinnedSpaces: mutate,
  };
}
