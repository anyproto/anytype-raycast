import { Icon, Image, List } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { DisplayMember, DisplayObject, DisplayType } from "../models";
import ObjectActions from "./ObjectActions";

type ObjectListItemProps = {
  spaceId: string;
  objectId: string;
  icon: string | { source: string; mask: Image.Mask };
  title: string;
  subtitle?: { value: string; tooltip: string };
  accessories?: {
    icon?: Icon | { source: string; mask: Image.Mask };
    date?: Date;
    text?: string;
    tooltip?: string;
  }[];
  mutate: MutatePromise<DisplayObject[] | DisplayType[] | DisplayMember[]>[];
  layout: string;
  viewType: string;
  isGlobalSearch: boolean;
  isNoPinView: boolean;
  isPinned: boolean;
};

export default function ObjectListItem({
  spaceId,
  objectId,
  icon,
  title,
  subtitle,
  accessories,
  mutate,
  layout,
  viewType,
  isGlobalSearch,
  isNoPinView,
  isPinned,
}: ObjectListItemProps) {
  return (
    <List.Item
      title={title}
      subtitle={subtitle ? { value: subtitle.value, tooltip: subtitle.tooltip } : undefined}
      icon={typeof icon === "string" ? { source: icon } : icon}
      accessories={[
        ...(accessories?.map((accessory) => {
          const { icon, date, text, tooltip } = accessory;
          const accessoryProps: {
            icon?: Icon | { source: string; mask: Image.Mask };
            date?: Date;
            text?: string;
            tooltip?: string;
          } = {};

          if (icon) accessoryProps.icon = icon;
          if (date) accessoryProps.date = date;
          if (text) accessoryProps.text = text;
          if (tooltip) accessoryProps.tooltip = tooltip;

          return accessoryProps;
        }) || []),
      ]}
      actions={
        <ObjectActions
          spaceId={spaceId}
          objectId={objectId}
          title={title}
          mutate={mutate}
          layout={layout}
          viewType={viewType}
          isGlobalSearch={isGlobalSearch}
          isNoPinView={isNoPinView}
          isPinned={isPinned}
        />
      }
    />
  );
}
