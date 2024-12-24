import { Action, ActionPanel, List, Image } from "@raycast/api";
import ChatList from "./ChatList";
import { Member, Space } from "../utils/schemas";
import * as C from "../utils/constants";

type ChatSpaceListItemProps = {
  space: Space;
  icon: Image;
  members: Member[] | undefined;
};

export default function ChatSpaceListItem({
  space,
  icon,
  members,
}: ChatSpaceListItemProps) {
  const memberCount = members?.length || 0;
  return (
    <List.Item
      key={space.id}
      title={space.name}
      accessories={[
        {
          icon: C.SPACE_MEMBER_ICON,
          text: memberCount.toString(),
          tooltip: `Members: ${memberCount}`,
        },
      ]}
      icon={icon}
      actions={
        <ActionPanel title={space.name}>
          <Action.Push
            title="View Messages"
            target={<ChatList key={space.id} spaceId={space.id} />}
          />
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
