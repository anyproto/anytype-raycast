import { Image, List } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { ObjectActions } from ".";
import { Dataview, Member, Space, SpaceObject, Type } from "../models";

type ObjectListItemProps = {
  space: Space;
  objectId: string;
  icon: Image.ImageLike;
  title: string;
  dataview: Dataview | undefined;
  subtitle?: { value: string; tooltip: string };
  accessories?: {
    icon?: Image.ImageLike;
    date?: Date;
    text?: string;
    tooltip?: string;
  }[];
  mutate: MutatePromise<SpaceObject[] | Type[] | Member[]>[];
  layout: string;
  viewType: string;
  isGlobalSearch: boolean;
  isNoPinView: boolean;
  isPinned: boolean;
};

export function ObjectListItem({
  space,
  objectId,
  icon,
  title,
  dataview,
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
      icon={icon}
      accessories={[
        ...(accessories?.map((accessory) => {
          const { icon, date, text, tooltip } = accessory;
          const accessoryProps: {
            icon?: Image.ImageLike;
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
          space={space}
          objectId={objectId}
          title={title}
          dataview={dataview}
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
