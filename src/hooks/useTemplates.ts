import { useCachedPromise } from "@raycast/utils";
import { getTemplates } from "../api/getTemplates";

export function useTemplates(spaceId: string, typeId: string) {
  const limit = 50;

  const { data, error, isLoading, pagination } = useCachedPromise(
    (spaceId: string, typeId: string) => async (options: { page: number }) => {
      const offset = options.page * limit;
      const response = await getTemplates(spaceId, typeId, { offset, limit });

      return {
        data: response.templates,
        hasMore: response.pagination.has_more,
      };
    },
    [spaceId, typeId],
    {
      keepPreviousData: true, // avoid flickering
    },
  );

  return {
    templates: data,
    templatesError: error,
    isLoadingTemplates: isLoading,
    templatesPagination: pagination,
  };
}
