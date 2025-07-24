import { useCachedPromise } from "@raycast/utils";
import { useMemo } from "react";
import { getSpaces } from "../api";
import { apiLimit, useAuthTs } from "../utils";

export function useSpaces() {
  const authTs = useAuthTs();

  const { data, error, isLoading, mutate, pagination } = useCachedPromise(
    (_authTs) => async (options: { page: number }) => {
      const offset = options.page * apiLimit;
      const response = await getSpaces({ offset, limit: apiLimit });

      return {
        data: response.spaces,
        hasMore: response.pagination.has_more,
      };
    },
    [authTs],
    {
      keepPreviousData: true,
    },
  );

  // filter empty data to prevent flickering at the bottom
  const filteredData = useMemo(() => data?.filter((space) => space) || [], [data]);

  return {
    spaces: filteredData,
    spacesError: error,
    isLoadingSpaces: isLoading,
    mutateSpaces: mutate,
    spacesPagination: pagination,
  };
}
