import { ActionPanel, Action, Icon, Clipboard, showToast, Toast, Keyboard, confirmAlert, Color } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import ObjectDetail from "./ObjectDetail";
import { SpaceObject, Type, Member } from "../utils/schemas";
import { Detail } from "../utils/schemas";

type ObjectActionsProps = {
  spaceId: string;
  objectId: string;
  title: string;
  details?: Detail[];
  mutate?: MutatePromise<SpaceObject[] | Type[] | Member[]>;
};

export default function ObjectActions({ spaceId, objectId, title, details, mutate }: ObjectActionsProps) {
  const objectUrl = `anytype://object?objectId=${objectId}&spaceId=${spaceId}`;

  async function handleCopyLink() {
    await Clipboard.copy(objectUrl);
    await showToast({
      title: "Link Copied",
      message: "The object link has been copied to your clipboard",
      style: Toast.Style.Success,
    });
  }

  async function handleDeleteObject() {
    const confirm = await confirmAlert({
      title: "Delete Object",
      message: `Are you sure you want to delete "${title}"?`,
      icon: { source: Icon.Trash, tintColor: Color.Red },
    });

    if (confirm) {
      try {
        await showToast({ style: Toast.Style.Animated, title: "Deleting object" });

        // TODO: Implement the deletion logic here

        await showToast({
          style: Toast.Style.Success,
          title: "Object deleted",
          message: `"${title}" has been deleted.`,
        });
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to delete object",
          message: error instanceof Error ? error.message : "An unknown error occurred.",
        });
      }
    }
  }

  async function handleRefresh() {
    await showToast({ style: Toast.Style.Animated, title: "Refreshing objects" });
    if (mutate) {
      try {
        await mutate();
        await showToast({ style: Toast.Style.Success, title: "Objects refreshed" });
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to refresh objects",
          message: error instanceof Error ? error.message : "An unknown error occurred.",
        });
      }
    }
  }

  return (
    <ActionPanel title={title}>
      <ActionPanel.Section>
        <Action.Push
          icon={{ source: Icon.Sidebar }}
          title="Show Details"
          target={<ObjectDetail spaceId={spaceId} objectId={objectId} details={details || []} />}
        />
        <Action.OpenInBrowser icon={{ source: "../assets/anytype-icon.png" }} title="Open in Anytype" url={objectUrl} />
      </ActionPanel.Section>

      <Action
        icon={Icon.Link}
        title="Copy Link"
        shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
        onAction={handleCopyLink}
      />
      <Action
        icon={Icon.Trash}
        title="Delete Object"
        style={Action.Style.Destructive}
        shortcut={Keyboard.Shortcut.Common.Remove}
        onAction={handleDeleteObject}
      />

      <ActionPanel.Section>
        <Action
          icon={Icon.RotateClockwise}
          title="Refresh Object"
          shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
          onAction={handleRefresh}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}
