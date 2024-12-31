import { useCachedPromise } from "@raycast/utils";
import { getObjects } from "../api/getObjects";
import { useMemo } from "react";

export function useObjects(spaceId: string) {
  const limit = 50;

  const { data, error, isLoading, pagination } = useCachedPromise(
    (spaceId: string) => async (options: { page: number }) => {
      const offset = options.page * limit;
      const response = await getObjects(spaceId, { offset, limit });

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
  const filteredData = useMemo(
    () => data?.filter((object) => object) || [],
    [data],
  );

  return {
    objects: filteredData,
    objectsError: error,
    isLoadingObjects: isLoading,
    objectsPagination: pagination,
  };
}
