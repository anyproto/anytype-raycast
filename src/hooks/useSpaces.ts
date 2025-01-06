import { useCachedPromise } from "@raycast/utils";
import { getSpaces } from "../api/getSpaces";
import { useMemo } from "react";
import { API_LIMIT } from "../utils/constants";

export function useSpaces() {
  const { data, error, isLoading, mutate, pagination } = useCachedPromise(
    () => async (options: { page: number }) => {
      const offset = options.page * API_LIMIT;
      const response = await getSpaces({ offset, limit: API_LIMIT });

      return {
        data: response.spaces,
        hasMore: response.pagination.has_more,
      };
    },
    [],
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
