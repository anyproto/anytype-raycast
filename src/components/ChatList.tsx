import { List, Toast, showToast } from "@raycast/api";
import { useState } from "react";
import * as A from "../hooks/api";
import ChatListItem from "./ChatListItem";

export default function ChatList({ spaceId }: { spaceId: string }) {
  const { isLoading: isLoadingMessages, data: { chatId, messages } = {} } =
    A.useGetChatMessages(spaceId);
  const { isLoading: isLoadingMembers, data: members } =
    A.useGetSpaceMembers(spaceId);
  const [messageText, setMessageText] = useState("");

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  async function handleCreateMessage(spaceId: string, messageText: string) {
    try {
      await A.createChatMessage(spaceId, messageText);
      await showToast(Toast.Style.Success, "Message posted successfully");
      setMessageText(""); // Clear the message text after sending
    } catch (error) {
      console.error("Failed to post message:", error);
      await showToast(
        Toast.Style.Failure,
        "Failed to post message",
        (error as Error).message,
      );
    }
  }

  return (
    <List
      isLoading={isLoadingMessages || isLoadingMembers}
      isShowingDetail={true}
      searchBarPlaceholder="Enter your message..."
      searchText={messageText}
      onSearchTextChange={setMessageText}
    >
      {Array.from({ length: 7 }, (_, i) => {
        const sectionDate = new Date(today);
        sectionDate.setDate(today.getDate() - i);

        let sectionTitle;
        if (i === 0) {
          sectionTitle = "Today";
        } else if (i === 1) {
          sectionTitle = "Yesterday";
        } else if (i === 6) {
          sectionTitle = "Older";
        } else {
          sectionTitle = sectionDate.toLocaleDateString(undefined, {
            weekday: "long",
          });
        }

        type Message = { created_at: number };

        const filterFunction = (message: Message) => {
          const messageDate = new Date(message.created_at * 1000);
          if (i === 6) {
            return messageDate < sectionDate;
          }
          return messageDate.toDateString() === sectionDate.toDateString();
        };

        return (
          <List.Section key={sectionTitle} title={sectionTitle}>
            {messages
              ?.filter(filterFunction)
              .sort((a, b) => b.created_at - a.created_at)
              .map((message) => (
                <ChatListItem
                  key={message.id}
                  spaceId={spaceId}
                  chatId={chatId ?? ""}
                  message={message}
                  members={members}
                  messageText={messageText}
                  handleCreateMessage={handleCreateMessage}
                />
              ))}
          </List.Section>
        );
      })}
    </List>
  );
}
