import { useCachedPromise } from "@raycast/utils";
import { getMembers } from "../api/getMembers";

export function useMembers(spaceId: string) {
  const limit = 50;

  const { data, error, isLoading, pagination } = useCachedPromise(
    (spaceId: string) => async (options: { page: number }) => {
      const offset = options.page * limit;
      const response = await getMembers(spaceId, { offset, limit });

      return {
        data: response.members,
        hasMore: response.pagination.has_more,
      };
    },
    [spaceId],
    {
      keepPreviousData: true,
    },
  );

  // filter empty data to prevent flickering at the bottom
  const filteredData = data?.filter((member) => member) || [];

  return {
    members: filteredData,
    membersError: error,
    isLoadingMembers: isLoading,
    membersPagination: pagination,
  };
}
