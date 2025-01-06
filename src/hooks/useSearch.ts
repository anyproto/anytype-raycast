import { useCachedPromise } from "@raycast/utils";
import { search } from "../api/search";
import { useMemo } from "react";
import { API_LIMIT } from "../utils/constants";

export function useSearch(searchText: string, type: string[]) {
  const { data, error, isLoading, pagination } = useCachedPromise(
    (searchText: string, type: string[]) => async (options: { page: number }) => {
      const offset = options.page * API_LIMIT;
      const response = await search(searchText, type, { offset, limit: API_LIMIT });

      return {
        data: response.data,
        hasMore: response.pagination.has_more,
      };
    },
    [searchText, type],
    {
      keepPreviousData: true,
    },
  );

  // filter empty data to prevent flickering at the bottom
  const filteredData = useMemo(() => data?.filter((object) => object) || [], [data]);

  return {
    objects: filteredData,
    objectsError: error,
    isLoadingObjects: isLoading,
    objectsPagination: pagination,
  };
}
