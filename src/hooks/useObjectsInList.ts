import { useCachedPromise } from "@raycast/utils";
import { useMemo } from "react";
import { getObjectsInList } from "../api/getObjectsInList";
import { apiLimit } from "../helpers/constant";

export function useObjectsInList(spaceId: string, listId: string) {
  const { data, error, isLoading, mutate, pagination } = useCachedPromise(
    (spaceId: string, listId) => async (options: { page: number }) => {
      const offset = options.page * apiLimit;
      const response = await getObjectsInList(spaceId, listId, { offset, limit: apiLimit });

      return {
        data: response.objects,
        hasMore: response.pagination.has_more,
      };
    },
    [spaceId, listId],
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
