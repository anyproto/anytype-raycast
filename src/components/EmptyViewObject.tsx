import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useEffect } from "react";
import { CreateObjectFormValues } from "../create-object";
import { useCreateObjectData } from "../hooks/useCreateObjectData";
import CreateObjectForm from "./CreateObjectForm";

type EmptyViewObjectProps = {
  title: string;
  contextValues: CreateObjectFormValues;
};

export default function EmptyViewObject({ title, contextValues }: EmptyViewObjectProps) {
  const draftValues: CreateObjectFormValues = {
    space: contextValues.space,
    type: contextValues.type,
    list: contextValues.list,
    name: contextValues.name,
    icon: contextValues.icon,
    description: contextValues.description,
    body: contextValues.body,
    source: contextValues.source,
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
  } = useCreateObjectData(draftValues);

  useEffect(() => {
    if (spaces.length > 0 && !selectedSpace) {
      setSelectedSpace(spaces[0].id);
    }
  }, [spaces]);

  useEffect(() => {
    if (objectTypes.length > 0 && !selectedType) {
      setSelectedType(objectTypes[0].id);
    }
  }, [objectTypes]);

  return (
    <List.EmptyView
      title={title}
      description="Create a new object by pressing ⏎"
      actions={
        <ActionPanel>
          <Action.Push
            title="Create Object"
            target={
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
                draftValues={draftValues}
                enableDrafts={false}
              />
            }
            icon={Icon.Plus}
          />
        </ActionPanel>
      }
    />
  );
}
