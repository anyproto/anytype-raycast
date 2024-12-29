import { useCachedPromise } from "@raycast/utils";
import { getTypes } from "../api/getTypes";

export function useTypes(spaceId: string) {
  const limit = 50;

  const { data, error, isLoading, pagination } = useCachedPromise(
    (spaceId: string) => async (options: { page: number }) => {
      const offset = options.page * limit;
      const response = await getTypes(spaceId, { offset, limit });

      return {
        data: response.types,
        hasMore: response.pagination.has_more,
      };
    },
    [spaceId],
    {
      keepPreviousData: true, // avoid flickering
    },
  );

  return {
    types: data,
    typesError: error,
    isLoadingTypes: isLoading,
    typesPagination: pagination,
  };
}
