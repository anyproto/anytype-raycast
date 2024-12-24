import {
  List,
  Image,
  showToast,
  Toast,
  ActionPanel,
  Action,
} from "@raycast/api";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import ChatListItemDetail from "./ChatListItemDetail";
import * as S from "../utils/schemas";
import * as C from "../utils/constants";

type ChatListItemProps = {
  spaceId: string;
  chatId: string;
  message: S.ChatMessage;
  members: S.Member[] | undefined;
  messageText: string;
  handleCreateMessage: (spaceId: string, messageText: string) => void;
};

export default function ChatListItem({
  spaceId,
  chatId,
  message,
  members,
  messageText,
  handleCreateMessage,
}: ChatListItemProps) {
  const reactions = Object.keys(message.reactions?.reactions || {}).join(" ");
  const [identityToMember, setIdentityToMember] = useState<
    Record<string, S.Member>
  >({});

  useEffect(() => {
    if (Array.isArray(members)) {
      const memberMap = members.reduce(
        (acc: Record<string, S.Member>, member: S.Member) => {
          acc[member.identity] = member;
          return acc;
        },
        {},
      );
      setIdentityToMember(memberMap);
    } else {
      console.error("Members is not an array");
      showToast(
        Toast.Style.Failure,
        "Failed to resolve members",
        "Members is not an array",
      );
    }
  }, [members]);

  return (
    <List.Item
      key={message.id}
      title={message.message.text}
      accessories={[
        {
          // TODO: time format to be localized, e.g. de-DE
          text: reactions,
          tooltip:
            Object.entries(message.reactions?.reactions || {}).length > 0
              ? `Reactions: ${Object.entries(message.reactions.reactions)
                  .map(([emoji, users]) => `${emoji}: ${users.ids.length}`)
                  .join(", ")}`
              : "",
        },
        {
          text: format(new Date(message.created_at), "HH:mm"),
          tooltip: `Created: ${format(new Date(message.created_at), "dd.MM.yyyy HH:mm")}`,
        },
      ]}
      icon={{
        source: identityToMember[message.creator]?.icon || C.SPACE_MEMBER_ICON,
        mask: Image.Mask.Circle,
      }}
      detail={ChatListItemDetail(message, members)}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser
            title="Open Chat in Anytype"
            url={`anytype://object?objectId=${chatId}&spaceId=${spaceId}`}
          />
          <Action
            title="Send Message"
            onAction={() => handleCreateMessage(spaceId, messageText)}
          />
        </ActionPanel>
      }
    />
  );
}
