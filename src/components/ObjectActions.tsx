import { Action, ActionPanel, Clipboard, Color, confirmAlert, Icon, Keyboard, showToast, Toast } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { deleteObject } from "../api/deleteObject";
import { Export, Member, SpaceObject, Template, Type } from "../helpers/schemas";
import { addPinnedObject, moveDownInPinned, moveUpInPinned, removePinnedObject } from "../helpers/storage";
import { pluralize } from "../helpers/strings";
import ObjectDetail from "./ObjectDetail";
import TemplateList from "./TemplateList";

type ObjectActionsProps = {
  spaceId: string;
  objectId: string;
  title: string;
  objectExport?: Export;
  mutate?: MutatePromise<SpaceObject[] | Type[] | Member[]>[];
  mutateTemplates?: MutatePromise<Template[]>;
  mutateObject?: MutatePromise<SpaceObject | null | undefined>;
  mutateExport?: MutatePromise<Export | undefined>;
  viewType: string;
  isGlobalSearch: boolean;
  isPinned: boolean;
};

export default function ObjectActions({
  spaceId,
  objectId,
  title,
  mutate,
  objectExport,
  mutateTemplates,
  mutateObject,
  mutateExport,
  viewType,
  isGlobalSearch,
  isPinned,
}: ObjectActionsProps) {
  const objectUrl = `anytype://object?objectId=${objectId}&spaceId=${spaceId}`;
  const pinSuffixForView = isGlobalSearch ? "all" : `${spaceId}_${viewType}`;
  const isDetailView = objectExport !== undefined;
  const isType = viewType === "type";

  function getContextLabel(isSingular = true) {
    const labelMap: Record<string, string> = {
      // browse
      object: "Object",
      type: "Type",
      member: "Member",
      template: "Template",

      // search
      all: "Object",
      page: "Page",
      task: "Task",
      list: "List",
      bookmark: "Bookmark",
    };
    const baseLabel = labelMap[viewType] || "Item";
    return !isDetailView && !isSingular ? pluralize(2, baseLabel) : baseLabel;
  }

  async function handleCopyLink() {
    await Clipboard.copy(objectUrl);
    await showToast({
      title: "Link copied",
      message: `The ${getContextLabel().toLowerCase()} link has been copied to your clipboard.`,
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
          for (const m of mutate) {
            await m();
          }
        }
        if (mutateTemplates) {
          await mutateTemplates();
        }
        if (mutateObject) {
          await mutateObject();
        }
        if (mutateExport) {
          await mutateExport();
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
    const label = getContextLabel(false);
    await showToast({
      style: Toast.Style.Animated,
      title: `Refreshing ${label}...`,
    });
    try {
      if (mutate) {
        for (const m of mutate) {
          await m();
        }
      }
      if (mutateTemplates) {
        await mutateTemplates();
      }
      if (mutateObject) {
        await mutateObject();
      }
      if (mutateExport) {
        await mutateExport();
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

  async function handleMoveUpInFavorites() {
    await moveUpInPinned(spaceId, objectId, pinSuffixForView);
    if (mutate) {
      for (const m of mutate) {
        await m();
      }
    }
    await showToast({
      style: Toast.Style.Success,
      title: "Moved Up in Pinned",
    });
  }

  async function handleMoveDownInFavorites() {
    await moveDownInPinned(spaceId, objectId, pinSuffixForView);
    if (mutate) {
      for (const m of mutate) {
        await m();
      }
    }

    await showToast({
      style: Toast.Style.Success,
      title: "Moved Down in Pinned",
    });
  }

  async function handlePin() {
    if (isPinned) {
      await removePinnedObject(spaceId, objectId, pinSuffixForView, title, getContextLabel());
    } else {
      await addPinnedObject(spaceId, objectId, pinSuffixForView, title, getContextLabel());
    }
    if (mutate) {
      for (const m of mutate) {
        await m();
      }
    }
  }

  return (
    <ActionPanel title={title}>
      <ActionPanel.Section>
        {!isType && !isDetailView && (
          <Action.Push
            icon={{ source: Icon.Sidebar }}
            title="Show Details"
            target={
              <ObjectDetail
                spaceId={spaceId}
                objectId={objectId}
                title={title}
                isGlobalSearch={isGlobalSearch}
                isPinned={isPinned}
              />
            }
          />
        )}
        {isType && (
          <Action.Push
            icon={Icon.BulletPoints}
            title="View Templates"
            target={
              <TemplateList spaceId={spaceId} typeId={objectId} isGlobalSearch={isGlobalSearch} isPinned={isPinned} />
            }
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

      {!isDetailView && (
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
      )}

      <ActionPanel.Section>
        <Action
          icon={Icon.RotateClockwise}
          title={`Refresh ${getContextLabel(false)}`}
          shortcut={Keyboard.Shortcut.Common.Refresh}
          onAction={handleRefresh}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}
