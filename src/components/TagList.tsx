import { Action, ActionPanel, Icon, Keyboard, List, showToast, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { useEffect, useState } from "react";
import { useTags } from "../hooks/useTags";
import { Space } from "../models";
import { EmptyViewTag } from "./EmptyView/EmptyViewTag";

interface TagListProps {
  space: Space;
  propertyId: string;
}

export function TagList({ space, propertyId }: TagListProps) {
  const [searchText, setSearchText] = useState("");
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

  const filteredTags = tags?.filter((tag) => tag.name.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <List
      isLoading={isLoadingTags}
      onSearchTextChange={setSearchText}
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
      {filteredTags && filteredTags.length > 0 ? (
        filteredTags.map((tag) => (
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
        ))
      ) : (
        <EmptyViewTag
          title="No Tags Found"
          spaceId={space.id}
          propertyId={propertyId}
          contextValues={{
            name: "",
          }}
        />
      )}
    </List>
  );
}
