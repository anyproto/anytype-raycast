import { useCachedPromise } from "@raycast/utils";
import { getSpaces } from "../api/getSpaces";

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
      keepPreviousData: true, // avoid flickering
    },
  );

  return {
    spaces: data,
    spacesError: error,
    isLoadingSpaces: isLoading,
    spacesPagination: pagination,
  };
}
