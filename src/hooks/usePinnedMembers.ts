import { useCachedPromise } from "@raycast/utils";
import { getMember } from "../api";
import { getPinned, removePinned } from "../utils";

export function usePinnedMembers(spaceId: string) {
  const { data, error, isLoading, mutate } = useCachedPromise(
    async (spaceId) => {
      const pinnedMembers = await getPinned(spaceId);
      const members = await Promise.all(
        pinnedMembers.map(async (pinned) => {
          try {
            const response = await getMember(pinned.spaceId, pinned.objectId);
            return response.member;
          } catch (error) {
            const typedError = error as Error & { status?: number };
            if (typedError.status === 404) {
              await removePinned(pinned.spaceId, pinned.objectId, spaceId);
            }
            return null;
          }
        }),
      );
      return members.filter((member) => member !== null);
    },
    [spaceId],
    {
      keepPreviousData: true,
    },
  );

  return {
    pinnedMembers: data,
    pinnedMembersError: error,
    isLoadingPinnedMembers: isLoading,
    mutatePinnedMembers: mutate,
  };
}
