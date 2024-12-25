import { useCachedPromise } from "@raycast/utils";
import { getTemplates } from "../api/getTemplates";

export function useTemplates(spaceId: string, typeId: string) {
  const { data, error, isLoading } = useCachedPromise(getTemplates, [
    spaceId,
    typeId,
  ]);

  return {
    templates: data?.templates,
    templatesError: error,
    isLoadingTemplates: isLoading,
  };
}
