import { Action, ActionPanel, List, Image, Icon, showToast, Toast } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import ObjectList from "./ObjectList";
import { Space } from "../utils/schemas";
import { MEMBER_ICON } from "../utils/constants";

type SpaceListItemProps = {
  space: Space;
  icon: Image;
  memberCount: number;
  mutate: MutatePromise<Space[]>;
};

export default function SpaceListItem({ space, icon, memberCount, mutate }: SpaceListItemProps) {
  async function handleRefresh() {
    await showToast({ style: Toast.Style.Animated, title: "Refreshing spaces" });
    if (mutate) {
      try {
        await mutate();
        await showToast({ style: Toast.Style.Success, title: "Spaces refreshed" });
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to refresh spaces",
          message: error instanceof Error ? error.message : "An unknown error occurred.",
        });
      }
    }
  }

  return (
    <List.Item
      key={space.id}
      title={space.name}
      accessories={[
        {
          icon: MEMBER_ICON,
          text: memberCount.toString(),
          tooltip: `Members: ${memberCount}`,
        },
      ]}
      icon={icon}
      actions={
        <ActionPanel title={space.name}>
          <Action.Push title="View Objects" target={<ObjectList key={space.id} spaceId={space.id} />} />
          <ActionPanel.Section>
            <Action
              icon={Icon.RotateClockwise}
              title="Refresh Object"
              shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
              onAction={handleRefresh}
            />
          </ActionPanel.Section>
          <Action.OpenInBrowser
            icon={{ source: "../assets/anytype-icon.png" }}
            title="Open Space in Anytype"
            url={`anytype://main/object/_blank_/spaceId/${space.id}`}
          />
        </ActionPanel>
      }
    />
  );
}
