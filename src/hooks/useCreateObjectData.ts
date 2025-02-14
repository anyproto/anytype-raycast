import { showToast, Toast } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useEffect, useMemo, useState } from "react";
import { CreateObjectFormValues } from "../create-object";
import { fetchAllTypesForSpace } from "../helpers/types";
import { useSearch } from "./useSearch";
import { useSpaces } from "./useSpaces";

export function useCreateObjectData(initialValues?: CreateObjectFormValues) {
  const [selectedSpace, setSelectedSpace] = useState(initialValues?.space || "");
  const [selectedType, setSelectedType] = useState(initialValues?.type || "");
  const [selectedList, setSelectedList] = useState(initialValues?.list || "");
  const { spaces, spacesError, isLoadingSpaces } = useSpaces();
  const {
    objects: lists,
    objectsError: listsError,
    isLoadingObjects: isLoadingLists,
  } = useSearch(selectedSpace, "", ["ot-collection"]);

  const restrictedTypes = [
    "ot-audio",
    "ot-chat",
    "ot-file",
    "ot-image",
    "ot-objectType",
    "ot-tag",
    "ot-template",
    "ot-video",
    "ot-participant",
  ];

  const {
    data: allTypes,
    error: typesError,
    isLoading: isLoadingTypes,
  } = useCachedPromise(fetchAllTypesForSpace, [selectedSpace], { execute: !!selectedSpace });

  const objectTypes = useMemo(() => {
    if (!allTypes) return [];
    return allTypes.filter((type) => !restrictedTypes.includes(type.unique_key));
  }, [allTypes, restrictedTypes]);

  useEffect(() => {
    if (spacesError || listsError || typesError) {
      showToast(
        Toast.Style.Failure,
        "Failed to fetch latest data",
        spacesError?.message || listsError?.message || typesError?.message,
      );
    }
  }, [spacesError, listsError, typesError]);

  const isLoading = isLoadingSpaces || isLoadingTypes || isLoadingLists;

  return {
    spaces,
    lists,
    objectTypes,
    selectedSpace,
    setSelectedSpace,
    selectedType,
    setSelectedType,
    selectedList,
    setSelectedList,
    isLoading,
  };
}
