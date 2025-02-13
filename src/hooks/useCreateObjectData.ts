import { showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { CreateObjectFormValues } from "../create-object";
import { Type } from "../helpers/schemas";
import { fetchAllTypesForSpace } from "../helpers/types";
import { useSearch } from "./useSearch";
import { useSpaces } from "./useSpaces";

export function useCreateObjectData(initialValues?: CreateObjectFormValues) {
  const [selectedSpace, setSelectedSpace] = useState(initialValues?.space || "");
  const [selectedType, setSelectedType] = useState(initialValues?.type || "");
  const [selectedList, setSelectedList] = useState(initialValues?.list || "");
  const [filteredTypes, setFilteredTypes] = useState<Type[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
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

  useEffect(() => {
    if (spaces.length > 0 && !selectedSpace) {
      setSelectedSpace(spaces[0].id);
    }
  }, [spaces]);

  useEffect(() => {
    const fetchAllTypes = async () => {
      if (selectedSpace) {
        setIsLoadingTypes(true);
        try {
          const allTypes = await fetchAllTypesForSpace(selectedSpace);
          const validTypes = allTypes.filter((type) => !restrictedTypes.includes(type.unique_key));
          setFilteredTypes(validTypes);
        } catch (error) {
          if (error instanceof Error) {
            showToast(Toast.Style.Failure, "Failed to fetch types", error.message);
          } else {
            showToast(Toast.Style.Failure, "Failed to fetch types", "An unknown error occurred.");
          }
        } finally {
          setIsLoadingTypes(false);
        }
      }
    };

    fetchAllTypes();
  }, [selectedSpace]);

  useEffect(() => {
    if (filteredTypes.length > 0 && !selectedType) {
      setSelectedType(filteredTypes[0].unique_key);
    }
  }, [filteredTypes]);

  useEffect(() => {
    if (spacesError || listsError) {
      showToast(Toast.Style.Failure, "Failed to fetch latest data", spacesError?.message || listsError?.message);
    }
  }, [spacesError, listsError]);

  const isLoading = isLoadingSpaces || isLoadingTypes || isLoadingLists;

  return {
    spaces,
    lists,
    objectTypes: filteredTypes,
    selectedSpace,
    setSelectedSpace,
    selectedType,
    setSelectedType,
    selectedList,
    setSelectedList,
    isLoading,
  };
}
