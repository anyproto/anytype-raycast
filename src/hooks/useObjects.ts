import { useCachedPromise } from "@raycast/utils";
import { getObjects } from "../api/getObjects";
import { useMemo } from "react";
import { API_LIMIT } from "../utils/constants";

export function useObjects(spaceId: string) {
  const { data, error, isLoading, mutate, pagination } = useCachedPromise(
    (spaceId: string) => async (options: { page: number }) => {
      const offset = options.page * API_LIMIT;
      const response = await getObjects(spaceId, { offset, limit: API_LIMIT });

      return {
        data: response.objects,
        hasMore: response.pagination.has_more,
      };
    },
    [spaceId],
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
    mutateObjects: mutate,
    objectsPagination: pagination,
  };
}
