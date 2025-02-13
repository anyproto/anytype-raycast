import { Action, ActionPanel, Icon, List } from "@raycast/api";
import Command, { CreateObjectFormValues } from "../create-object";

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

  return (
    <List.EmptyView
      title={title}
      description="Create a new object by pressing ⏎"
      actions={
        <ActionPanel>
          <Action.Push title="Create Object" target={<Command draftValues={draftValues} />} icon={Icon.Plus} />
        </ActionPanel>
      }
    />
  );
}
