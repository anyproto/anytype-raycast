import { Action, ActionPanel, Clipboard, confirmAlert, Icon, Keyboard, showToast, Toast, Color } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { Export } from "../utils/schemas";

type ObjectDetailActionsProps = {
  spaceId: string;
  objectId: string;
  title: string;
  objectExport: Export | undefined;
  mutate: MutatePromise<Export | undefined>;
};

export default function ObjectActions({ spaceId, objectId, title, objectExport, mutate }: ObjectDetailActionsProps) {
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
        <Action.OpenInBrowser icon={{ source: "../assets/anytype-icon.png" }} title="Open in Anytype" url={objectUrl} />
      </ActionPanel.Section>

      {objectExport && (
        <Action.CopyToClipboard
          title="Copy Object"
          shortcut={{ modifiers: ["cmd"], key: "c" }}
          content={objectExport.markdown}
        />
      )}
      <Action
        icon={Icon.Link}
        title="Copy Link"
        shortcut={Keyboard.Shortcut.Common.CopyDeeplink}
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
          shortcut={Keyboard.Shortcut.Common.Refresh}
          onAction={handleRefresh}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}
