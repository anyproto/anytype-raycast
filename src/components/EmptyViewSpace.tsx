import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { CreateSpaceForm } from ".";

export function EmptyViewSpace({ title }: { title: string }) {
  return (
    <List.EmptyView
      title={title}
      description="Create a new space by pressing ⏎"
      actions={
        <ActionPanel>
          <Action.Push title="Create Space" target={<CreateSpaceForm />} icon={Icon.Plus} />
        </ActionPanel>
      }
    />
  );
}
