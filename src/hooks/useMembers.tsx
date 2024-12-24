import { useCachedPromise } from "@raycast/utils";
import { getMembers } from "../api/getMembers";

export function useMembers(spaceId: string) {
  const { data, error, isLoading } = useCachedPromise(getMembers, [spaceId]);

  return {
    members: data?.members,
    membersError: error,
    isLoadingMembers: isLoading,
  };
}
