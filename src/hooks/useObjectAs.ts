import { useCachedPromise } from "@raycast/utils";
import { getObjectAs } from "../api/getObjectAs";

export function useObjectAs(spaceId: string, objectId: string, format: string) {
  const { data, error, isLoading } = useCachedPromise(
    async (spaceId, objectId, format) => {
      const response = await getObjectAs(spaceId, objectId, format);
      return response.objectAs;
    },
    [spaceId, objectId, format],
  );

  return {
    objectAs: data,
    objectAsError: error,
    isLoadingObjectAs: isLoading,
  };
}
