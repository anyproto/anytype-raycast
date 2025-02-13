import { LaunchProps, Toast, showToast } from "@raycast/api";
import { useEffect, useState } from "react";
import CreateObjectForm from "./components/CreateObjectForm";
import EnsureAuthenticated from "./components/EnsureAuthenticated";
import { Type } from "./helpers/schemas";
import { fetchAllTypesForSpace } from "./helpers/types";
import { useSearch } from "./hooks/useSearch";
import { useSpaces } from "./hooks/useSpaces";

export interface CreateObjectFormValues {
  space: string;
  type: string;
  list: string;
  name: string;
  icon: string;
  description: string;
  body: string;
  source: string;
}

interface LaunchContext {
  defaults: {
    space: string;
    type: string;
    list: string;
    name: string;
    icon: string;
    description: string;
    body: string;
    source: string;
  };
}

interface CreateObjectProps
  extends LaunchProps<{ draftValues?: CreateObjectFormValues; launchContext?: LaunchContext }> {}

export default function Command(props: CreateObjectProps) {
  return (
    <EnsureAuthenticated viewType="form">
      <CreateObject {...props} />
    </EnsureAuthenticated>
  );
}

function CreateObject({ draftValues, launchContext }: CreateObjectProps) {
  const mergedValues = {
    ...launchContext?.defaults,
    ...draftValues, // `draftValues` takes precedence
  };

  const [selectedSpace, setSelectedSpace] = useState(mergedValues?.space || "");
  const [selectedType, setSelectedType] = useState(mergedValues?.type || "");
  const [selectedList, setSelectedList] = useState(mergedValues?.list || "");
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

  return (
    <CreateObjectForm
      spaces={spaces || []}
      objectTypes={filteredTypes}
      lists={lists || []}
      selectedSpace={selectedSpace}
      setSelectedSpace={setSelectedSpace}
      selectedType={selectedType}
      setSelectedType={setSelectedType}
      selectedList={selectedList}
      setSelectedList={setSelectedList}
      isLoading={isLoadingSpaces || isLoadingTypes || isLoadingLists}
      draftValues={mergedValues as CreateObjectFormValues}
    />
  );
}
