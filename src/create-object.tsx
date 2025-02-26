import { LaunchProps } from "@raycast/api";
import CreateObjectForm from "./components/CreateObjectForm";
import EnsureAuthenticated from "./components/EnsureAuthenticated";
import { useCreateObjectData } from "./hooks/useCreateObjectData";

export interface CreateObjectFormValues {
  space?: string;
  type?: string;
  list?: string;
  name?: string;
  icon?: string;
  description?: string;
  body?: string;
  source?: string;
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

  const {
    spaces,
    lists,
    objectTypes,
    selectedSpace,
    setSelectedSpace,
    selectedType,
    setSelectedType,
    selectedList,
    setSelectedList,
    listSearchText,
    setListSearchText,
    isLoading,
  } = useCreateObjectData(mergedValues);

  return (
    <CreateObjectForm
      spaces={spaces}
      objectTypes={objectTypes}
      lists={lists}
      selectedSpace={selectedSpace}
      setSelectedSpace={setSelectedSpace}
      selectedType={selectedType}
      setSelectedType={setSelectedType}
      selectedList={selectedList}
      setSelectedList={setSelectedList}
      listSearchText={listSearchText}
      setListSearchText={setListSearchText}
      isLoading={isLoading}
      draftValues={mergedValues}
      enableDrafts={true}
    />
  );
}
