import { useCachedPromise } from "@raycast/utils";
import { getObjects } from "../api/getObjects";

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
      keepPreviousData: true, // avoid flickering
    },
  );

  return {
    objects: data,
    objectsError: error,
    isLoadingObjects: isLoading,
    objectsPagination: pagination,
  };
}
