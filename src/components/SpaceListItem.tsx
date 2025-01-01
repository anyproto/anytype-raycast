import { Action, ActionPanel, List, Image } from "@raycast/api";
import ObjectList from "./ObjectList";
import { Space } from "../utils/schemas";
import { SPACE_MEMBER_ICON } from "../utils/constants";

type SpaceListItemProps = {
  space: Space;
  icon: Image;
  memberCount: number;
};

export default function SpaceListItem({ space, icon, memberCount }: SpaceListItemProps) {
  return (
    <List.Item
      key={space.id}
      title={space.name}
      accessories={[
        {
          icon: SPACE_MEMBER_ICON,
          text: memberCount.toString(),
          tooltip: `Members: ${memberCount}`,
        },
      ]}
      icon={icon}
      actions={
        <ActionPanel title={space.name}>
          <Action.Push title="View Objects" target={<ObjectList key={space.id} spaceId={space.id} />} />
          {/* <Action.OpenInBrowser
            icon={{ source: "../assets/anytype-icon.png" }}
            title="Open Space in Anytype"
            // TODO: how to open home object?
            url={`anytype://object?objectId=${space.home_object_id}&spaceId=${space.id}`}
          /> */}
        </ActionPanel>
      }
    />
  );
}
