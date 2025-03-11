import { Icon, Image, List } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { DisplaySpace } from "../models";
import SpaceActions from "./SpaceActions";

type SpaceListItemProps = {
  space: DisplaySpace;
  icon: Image;
  accessories?: {
    icon?: Icon | { source: string; mask?: Image.Mask; tintColor?: { light: string; dark: string } };
    date?: Date;
    text?: string;
    tooltip?: string;
  }[];
  mutate: MutatePromise<DisplaySpace[]>[];
  isPinned: boolean;
};

export default function SpaceListItem({ space, icon, accessories, mutate, isPinned }: SpaceListItemProps) {
  return (
    <List.Item
      key={space.id}
      title={space.name}
      accessories={[
        ...(accessories?.map((accessory) => {
          const { icon, date, text, tooltip } = accessory;
          const accessoryProps: {
            icon?: Icon | { source: string; tintColor?: { light: string; dark: string }; mask?: Image.Mask };
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
      icon={icon}
      actions={<SpaceActions space={space} mutate={mutate} isPinned={isPinned} />}
    />
  );
}
