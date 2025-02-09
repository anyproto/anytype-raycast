import { Action, ActionPanel, Clipboard, Icon, Keyboard, showToast, Toast } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { anytypeChatDeeplink, anytypeSpaceDeeplink } from "../helpers/constants";
import { Space } from "../helpers/schemas";
import { addPinned, moveDownInPinned, moveUpInPinned, removePinned } from "../helpers/storage";
import ObjectList from "./ObjectList";

type SpaceActionsProps = {
  space: Space;
  mutate: MutatePromise<Space[]>;
  isPinned: boolean;
};

export default function SpaceActions({ space, mutate, isPinned }: SpaceActionsProps) {
  const spaceDeeplink = anytypeSpaceDeeplink(space.id);
  const chatDeepLink = anytypeChatDeeplink(space.id, space.workspace_object_id);
  const pinSuffix = "spaces";

  async function handleCopyLink() {
    await Clipboard.copy(spaceDeeplink);
    await showToast({
      title: "Link copied",
      message: "The space link has been copied to your clipboard",
      style: Toast.Style.Success,
    });
  }

  async function handleMoveUpInFavorites() {
    await moveUpInPinned(space.id, space.id, pinSuffix);
    await mutate();
    await showToast({
      style: Toast.Style.Success,
      title: "Moved Up in Pinned",
    });
  }

  async function handleMoveDownInFavorites() {
    await moveDownInPinned(space.id, space.id, pinSuffix);
    await mutate();
    await showToast({
      style: Toast.Style.Success,
      title: "Moved Down in Pinned",
    });
  }

  async function handlePin() {
    if (isPinned) {
      await removePinned(space.id, space.id, pinSuffix, space.name, "Space");
    } else {
      await addPinned(space.id, space.id, pinSuffix, space.name, "Space");
    }
    await mutate();
  }

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
    <ActionPanel title={space.name}>
      <ActionPanel.Section>
        <Action.Push icon={Icon.List} title="View Objects" target={<ObjectList key={space.id} spaceId={space.id} />} />
        <Action.OpenInBrowser
          icon={{ source: "../assets/anytype-icon.png" }}
          title="Open Space in Anytype"
          url={spaceDeeplink}
        />
        <Action.OpenInBrowser
          icon={Icon.Bubble}
          title="Open Chat in Anytype"
          url={chatDeepLink}
          shortcut={{ modifiers: ["cmd"], key: "o" }}
        />
      </ActionPanel.Section>

      <Action
        icon={Icon.Link}
        title="Copy Link"
        shortcut={Keyboard.Shortcut.Common.CopyDeeplink}
        onAction={handleCopyLink}
      />

      <ActionPanel.Section>
        {isPinned && (
          <Action
            icon={Icon.ArrowUp}
            title="Move Up in Pinned" // eslint-disable-line @raycast/prefer-title-case
            shortcut={{ modifiers: ["opt", "cmd"], key: "arrowUp" }}
            onAction={handleMoveUpInFavorites}
          />
        )}
        {isPinned && (
          <Action
            icon={Icon.ArrowDown}
            title="Move Down in Pinned" // eslint-disable-line @raycast/prefer-title-case
            shortcut={{ modifiers: ["opt", "cmd"], key: "arrowDown" }}
            onAction={handleMoveDownInFavorites}
          />
        )}
        <Action
          icon={isPinned ? Icon.StarDisabled : Icon.Star}
          title={isPinned ? "Unpin Object" : "Pin Object"}
          shortcut={{ modifiers: ["cmd", "shift"], key: "f" }}
          onAction={handlePin}
        />
      </ActionPanel.Section>

      <ActionPanel.Section>
        <Action
          icon={Icon.RotateClockwise}
          title="Refresh Spaces"
          shortcut={Keyboard.Shortcut.Common.Refresh}
          onAction={handleRefresh}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}
