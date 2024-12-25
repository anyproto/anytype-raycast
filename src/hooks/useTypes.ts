import { useCachedPromise } from "@raycast/utils";
import { getTypes } from "../api/getTypes";

export function useTypes(spaceId: string) {
  const { data, error, isLoading } = useCachedPromise(getTypes, [spaceId]);

  return {
    types: data?.types,
    typesError: error,
    isLoadingTypes: isLoading,
  };
}
