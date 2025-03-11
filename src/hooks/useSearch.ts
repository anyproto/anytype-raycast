import { getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useMemo } from "react";
import { search } from "../api/search";
import { apiLimit } from "../helpers/constant";

export function useSearch(spaceId: string, query: string, types: string[]) {
  const { data, error, isLoading, mutate, pagination } = useCachedPromise(
    (spaceId: string, query: string, types: string[]) => async (options: { page: number }) => {
      const offset = options.page * apiLimit;
      const response = await search(
        spaceId,
        { query, types, sort: { direction: "desc", timestamp: getPreferenceValues().sort } },
        { offset, limit: apiLimit },
      );

      return {
        data: response.data,
        hasMore: response.pagination.has_more,
      };
    },
    [spaceId, query, types],
    {
      execute: !!spaceId,
      keepPreviousData: true,
    },
  );

  // filter empty data to prevent flickering at the bottom
  const filteredData = useMemo(() => data?.filter((object) => object) || [], [data]);

  return {
    objects: filteredData,
    objectsError: error,
    isLoadingObjects: isLoading,
    mutateObjects: mutate,
    objectsPagination: pagination,
  };
}
