import { useCachedPromise } from "@raycast/utils";
import { getTemplates } from "../api/getTemplates";
import { useMemo } from "react";
import { API_LIMIT } from "../utils/constants";

export function useTemplates(spaceId: string, typeId: string) {
  const { data, error, isLoading, pagination } = useCachedPromise(
    (spaceId: string, typeId: string) => async (options: { page: number }) => {
      const offset = options.page * API_LIMIT;
      const response = await getTemplates(spaceId, typeId, { offset, limit: API_LIMIT });

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
  const filteredData = useMemo(() => data?.filter((template) => template) || [], [data]);

  return {
    templates: filteredData,
    templatesError: error,
    isLoadingTemplates: isLoading,
    templatesPagination: pagination,
  };
}
