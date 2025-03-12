import { useCachedPromise } from "@raycast/utils";
import { getType } from "../api";
import { getPinned, removePinned } from "../utils";

export function usePinnedTypes(spaceId: string) {
  const { data, error, isLoading, mutate } = useCachedPromise(
    async (spaceId) => {
      const pinnedTypes = await getPinned(spaceId);
      const types = await Promise.all(
        pinnedTypes.map(async (pinned) => {
          try {
            const response = await getType(pinned.spaceId, pinned.objectId);
            return response.type;
          } catch (error) {
            const typedError = error as Error & { status?: number };
            if (typedError.status === 404) {
              await removePinned(pinned.spaceId, pinned.objectId, spaceId);
            }
            return null;
          }
        }),
      );
      return types.filter((type) => type !== null);
    },
    [spaceId],
    {
      keepPreviousData: true,
    },
  );

  return {
    pinnedTypes: data,
    pinnedTypesError: error,
    isLoadingPinnedTypes: isLoading,
    mutatePinnedTypes: mutate,
  };
}
