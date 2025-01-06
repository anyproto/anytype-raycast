import { useCachedPromise } from "@raycast/utils";
import { getTypes } from "../api/getTypes";
import { useMemo } from "react";
import { API_LIMIT } from "../utils/constants";

export function useTypes(spaceId: string) {
  const { data, error, isLoading, pagination } = useCachedPromise(
    (spaceId: string) => async (options: { page: number }) => {
      if (!spaceId) {
        return { data: [], hasMore: false };
      }
      const offset = options.page * API_LIMIT;
      const response = await getTypes(spaceId, { offset, limit: API_LIMIT });

      return {
        data: response.types,
        hasMore: response.pagination.has_more,
      };
    },
    [spaceId],
    {
      keepPreviousData: true,
    },
  );

  // filter empty data to prevent flickering at the bottom
  const filteredData = useMemo(() => data?.filter((type) => type) || [], [data]);

  return {
    types: filteredData,
    typesError: error,
    isLoadingTypes: isLoading && !!spaceId,
    typesPagination: pagination,
  };
}
