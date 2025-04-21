import { Action, ActionPanel, Icon, Keyboard, List, showToast, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { useEffect } from "react";
import { useTags } from "../hooks/useTags";
import { Space } from "../models";

interface TagListProps {
  space: Space;
  propertyId: string;
}

export function TagList({ space, propertyId }: TagListProps) {
  const { tags, isLoadingTags, tagsError, mutateTags, tagsPagination } = useTags(space.id, propertyId);

  useEffect(() => {
    if (tagsError) {
      showFailureToast(tagsError, { title: "Failed to fetch tags" });
    }
  }, [tagsError]);

  const handleRefresh = async () => {
    await showToast({
      style: Toast.Style.Animated,
      title: "Refreshing tags...",
    });
    try {
      await mutateTags();
      await showToast({
        style: Toast.Style.Success,
        title: "Tags refreshed",
      });
    } catch (error) {
      await showFailureToast(error, { title: "Failed to refresh tags" });
    }
  };

  return (
    <List
      isLoading={isLoadingTags}
      searchBarPlaceholder="Search tags..."
      navigationTitle={`Browse ${space.name}`}
      pagination={tagsPagination}
      throttle={true}
      actions={
        <ActionPanel>
          <Action
            icon={Icon.Repeat}
            title="Refresh Tags"
            onAction={handleRefresh}
            shortcut={Keyboard.Shortcut.Common.Refresh}
          />
        </ActionPanel>
      }
    >
      {tags.map((tag) => (
        <List.Item
          key={tag.id}
          title={tag.name}
          icon={{ source: Icon.Tag, tintColor: tag.color }}
          actions={
            <ActionPanel>
              <Action
                icon={Icon.Repeat}
                title="Refresh Tags"
                onAction={handleRefresh}
                shortcut={Keyboard.Shortcut.Common.Refresh}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
