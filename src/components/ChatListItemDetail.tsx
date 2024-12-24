import { List } from "@raycast/api";
import * as S from "../utils/schemas";

export default function ChatListItemDetail(
  message: S.ChatMessage,
  members: S.Member[] | undefined,
) {
  function getMarkdownForMessage(message: S.ChatMessage) {
    const creatorName =
      members?.find((member) => member.identity === message.creator)?.name ||
      message.creator;
    let body = `## ${creatorName}\n ${formatMessageDate(message.created_at)}\n\n---\n\n${message.message.text.replace(/\n/g, "  \n")}`;

    if (
      message.attachments[0]?.type === "IMAGE" ||
      message.attachments[0]?.type === "FILE"
    ) {
      body += `\n\n![Image](${message.attachments[0]?.target})`;
    }

    const reactionsMarkdown = Object.entries(message.reactions?.reactions || {})
      .map(([emoji, identityList]) => {
        const names = identityList.ids
          .map((id) => {
            const member = members?.find((member) => member.identity === id);
            return member ? member.name.split(" ")[0] : id;
          })
          .join(", ");
        return `**${emoji}**: ${names}`;
      })
      .join("  \n");

    if (reactionsMarkdown) {
      body += `\n\n---\n\n### Reactions\n${reactionsMarkdown}`;
    }

    return body;
  }

  function formatMessageDate(date: number): string {
    const messageDate = new Date(date * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = messageDate.toDateString() === today.toDateString();
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();

    if (isToday) {
      return `Today, ${messageDate.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (isYesterday) {
      return `Yesterday, ${messageDate.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return (
        messageDate.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) +
        `, ${messageDate.toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
    }
  }

  return <List.Item.Detail markdown={getMarkdownForMessage(message)} />;
}
