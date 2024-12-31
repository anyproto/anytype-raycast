import { useCachedPromise } from "@raycast/utils";
import { getSpaces } from "../api/getSpaces";
import { useMemo } from "react";

export function useSpaces() {
  const limit = 50;

  const { data, error, isLoading, pagination } = useCachedPromise(
    () => async (options: { page: number }) => {
      const offset = options.page * limit;
      const response = await getSpaces({ offset, limit });

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
  const filteredData = useMemo(
    () => data?.filter((space) => space) || [],
    [data],
  );

  return {
    spaces: filteredData,
    spacesError: error,
    isLoadingSpaces: isLoading,
    spacesPagination: pagination,
  };
}
