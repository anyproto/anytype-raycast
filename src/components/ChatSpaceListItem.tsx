import { Action, ActionPanel, List, Image } from "@raycast/api";
import { useState, useEffect } from "react";
import ChatList from "./ChatList";
import * as A from "../hooks/api";
import * as S from "../utils/schemas";
import * as C from "../utils/constants";

type ChatSpaceListItemProps = {
  space: S.Space;
  icon: Image;
};

export default function ChatSpaceListItem({
  space,
  icon,
}: ChatSpaceListItemProps) {
  const { data: members } = A.useGetSpaceMembers(space.id);
  const [amountOfMembers, setAmountOfMembers] = useState<number>(1);

  useEffect(() => {
    if (members) {
      setAmountOfMembers(members.length);
    }
  }, [members]);

  return (
    <List.Item
      key={space.id}
      title={space.name}
      accessories={[
        {
          icon: C.SPACE_MEMBER_ICON,
          text: amountOfMembers.toString(),
          tooltip: "Members: " + amountOfMembers,
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
