import { ActionPanel, Action, Icon, Clipboard, showToast, Toast, Keyboard, confirmAlert, Color } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import ObjectDetail from "./ObjectDetail";
import { SpaceObject, Type, Member } from "../utils/schemas";
import { Detail, Export } from "../utils/schemas";
import { deleteObject } from "../api/deleteObject";
import { pluralize } from "../utils/helpers";

type ObjectActionsProps = {
  spaceId: string;
  objectId: string;
  title: string;
  details?: Detail[];
  objectExport?: Export;
  mutate?: MutatePromise<SpaceObject[] | Type[] | Member[]>;
  exportMutate?: MutatePromise<Export | undefined>;
  viewType: "object" | "type" | "member";
};

export default function ObjectActions({
  spaceId,
  objectId,
  title,
  details,
  mutate,
  exportMutate,
  objectExport,
  viewType,
}: ObjectActionsProps) {
  const objectUrl = `anytype://object?objectId=${objectId}&spaceId=${spaceId}`;
  const isDetailView = objectExport !== undefined;

  function getContextLabel() {
    const baseLabel = (() => {
      switch (viewType) {
        case "object":
          return "Object";
        case "type":
          return "Type";
        case "member":
          return "Member";
        default:
          return "Item";
      }
    })();
    return !isDetailView ? pluralize(2, baseLabel) : baseLabel;
  }

  async function handleCopyLink() {
    await Clipboard.copy(objectUrl);
    await showToast({
      title: "Link Copied",
      message: `The ${getContextLabel()} link has been copied to your clipboard.`,
      style: Toast.Style.Success,
    });
  }

  async function handleDeleteObject() {
    const confirm = await confirmAlert({
      title: `Delete ${getContextLabel()}`,
      message: `Are you sure you want to delete "${title}"?`,
      icon: { source: Icon.Trash, tintColor: Color.Red },
    });

    if (confirm) {
      try {
        await deleteObject(spaceId, objectId);
        if (mutate) {
          await mutate();
        }
        if (exportMutate) {
          await exportMutate();
        }
        await showToast({
          style: Toast.Style.Success,
          title: `${getContextLabel()} deleted`,
          message: `"${title}" has been deleted.`,
        });
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: `Failed to delete ${getContextLabel()}`,
          message: error instanceof Error ? error.message : "An unknown error occurred.",
        });
      }
    }
  }

  async function handleRefresh() {
    const label = getContextLabel();
    await showToast({
      style: Toast.Style.Animated,
      title: `Refreshing ${label}...`,
    });
    try {
      if (mutate) {
        await mutate();
      }
      if (exportMutate) {
        await exportMutate();
      }
      await showToast({
        style: Toast.Style.Success,
        title: `${label} refreshed`,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: `Failed to refresh ${label}`,
        message: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  }

  return (
    <ActionPanel title={title}>
      <ActionPanel.Section>
        {details && details.length > 0 && (
          <Action.Push
            icon={{ source: Icon.Sidebar }}
            title="Show Details"
            target={<ObjectDetail spaceId={spaceId} objectId={objectId} title={title} details={details || []} />}
          />
        )}
        <Action.OpenInBrowser
          icon={{ source: "../assets/anytype-icon.png" }}
          title={`Open ${getContextLabel()} in Anytype`}
          url={objectUrl}
        />
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
        title={`Delete ${getContextLabel()}`}
        style={Action.Style.Destructive}
        shortcut={Keyboard.Shortcut.Common.Remove}
        onAction={handleDeleteObject}
      />

      <ActionPanel.Section>
        <Action
          icon={Icon.RotateClockwise}
          title={`Refresh ${getContextLabel()}`}
          shortcut={Keyboard.Shortcut.Common.Refresh}
          onAction={handleRefresh}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}
