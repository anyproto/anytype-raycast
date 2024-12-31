import { useCachedPromise } from "@raycast/utils";
import { getTemplates } from "../api/getTemplates";
import { useMemo } from "react";

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
      keepPreviousData: true,
    },
  );

  // filter empty data to prevent flickering at the bottom
  const filteredData = useMemo(
    () => data?.filter((template) => template) || [],
    [data],
  );

  return {
    templates: filteredData,
    templatesError: error,
    isLoadingTemplates: isLoading,
    templatesPagination: pagination,
  };
}
