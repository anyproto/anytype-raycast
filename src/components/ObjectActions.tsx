import {
  Action,
  ActionPanel,
  Clipboard,
  Color,
  confirmAlert,
  getPreferenceValues,
  Icon,
  Keyboard,
  showToast,
  Toast,
} from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { CollectionList, CurrentView, ObjectDetail, TemplateList } from ".";
import { deleteObject } from "../api";
import { Dataview, Export, Member, Space, SpaceObject, Template, Type } from "../models";
import { addPinned, localStorageKeys, moveDownInPinned, moveUpInPinned, pluralize, removePinned } from "../utils";

type ObjectActionsProps = {
  space: Space;
  objectId: string;
  title: string;
  dataview?: Dataview | undefined;
  objectExport?: Export;
  mutate?: MutatePromise<SpaceObject[] | Type[] | Member[]>[];
  mutateTemplates?: MutatePromise<Template[]>;
  mutateObject?: MutatePromise<SpaceObject | null | undefined>;
  mutateExport?: MutatePromise<Export | undefined>;
  layout?: string;
  viewType: string;
  isGlobalSearch: boolean;
  isNoPinView: boolean;
  isPinned: boolean;
  showDetails?: boolean;
  onToggleDetails?: () => void;
};

export function ObjectActions({
  space,
  objectId,
  title,
  dataview,
  mutate,
  objectExport,
  mutateTemplates,
  mutateObject,
  mutateExport,
  layout,
  viewType,
  isGlobalSearch,
  isNoPinView,
  isPinned,
  showDetails,
  onToggleDetails,
}: ObjectActionsProps) {
  const { primaryAction } = getPreferenceValues();
  const objectUrl = `anytype://object?objectId=${objectId}&spaceId=${space.id}`;
  const pinSuffixForView = isGlobalSearch
    ? localStorageKeys.suffixForGlobalSearch
    : localStorageKeys.suffixForViewsPerSpace(space.id, viewType);
  const isDetailView = objectExport !== undefined;
  const isCollection = layout === "collection";
  const isType = viewType === CurrentView.types;

  function getContextLabel(isSingular = true) {
    const labelMap: Record<string, string> = {
      // browse
      objects: "Object",
      types: "Type",
      members: "Member",
      templates: "Template",

      // search
      all: "Object",
      pages: "Page",
      tasks: "Task",
      lists: "List",
      bookmarks: "Bookmark",
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
        await deleteObject(space.id, objectId);
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

  async function handleMoveUpInFavorites() {
    await moveUpInPinned(space.id, objectId, pinSuffixForView);
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
    await moveDownInPinned(space.id, objectId, pinSuffixForView);
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
      await removePinned(space.id, objectId, pinSuffixForView, title, getContextLabel());
    } else {
      await addPinned(space.id, objectId, pinSuffixForView, title, getContextLabel());
    }
    if (mutate) {
      for (const m of mutate) {
        await m();
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

  const canShowDetails = !isType && !isCollection && !isDetailView;
  const showDetailsAction = canShowDetails && (
    <Action.Push
      icon={{ source: Icon.Sidebar }}
      title="Show Details"
      target={
        <ObjectDetail
          space={space}
          objectId={objectId}
          title={title}
          viewType={viewType}
          isGlobalSearch={isGlobalSearch}
          isPinned={isPinned}
        />
      }
    />
  );

  const openObjectAction = (
    <Action.OpenInBrowser
      icon={{ source: "../assets/anytype-icon.png" }}
      title={`Open ${getContextLabel()} in Anytype`}
      url={objectUrl}
    />
  );

  const firstPrimaryAction = primaryAction === "show_details" ? showDetailsAction : openObjectAction;
  const secondPrimaryAction = primaryAction === "show_details" ? openObjectAction : showDetailsAction;

  return (
    <ActionPanel title={title}>
      <ActionPanel.Section>
        {firstPrimaryAction}
        {isCollection && (
          <Action.Push
            icon={Icon.List}
            title="View Collection"
            target={<CollectionList space={space} listId={objectId} listName={title} dataview={dataview} />}
          />
        )}
        {isType && (
          <Action.Push
            icon={Icon.BulletPoints}
            title="View Templates"
            target={
              <TemplateList space={space} typeId={objectId} isGlobalSearch={isGlobalSearch} isPinned={isPinned} />
            }
          />
        )}
        {secondPrimaryAction}
      </ActionPanel.Section>
      <ActionPanel.Section>
        {objectExport && (
          <Action.CopyToClipboard
            title={`Copy Markdown`}
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
      </ActionPanel.Section>
      {!isDetailView && !isNoPinView && (
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
        {isDetailView && (
          <Action
            icon={showDetails ? Icon.EyeDisabled : Icon.Eye}
            title={showDetails ? "Hide Sidebar" : "Show Sidebar"}
            shortcut={{ modifiers: ["cmd"], key: "d" }}
            onAction={onToggleDetails}
          />
        )}
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
