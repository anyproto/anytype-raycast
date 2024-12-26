import { List, Icon, Image, ActionPanel, Action } from "@raycast/api";
import { Detail, Block } from "../utils/schemas";
import ObjectDetail from "./ObjectDetail";

type ObjectListItemProps = {
  spaceId: string;
  objectId: string;
  icon: string | { source: string; mask: Image.Mask };
  title: string;
  subtitle?: { value: string; tooltip?: string };
  accessories?: {
    icon?: Icon | { source: string; mask: Image.Mask };
    date?: Date;
    text?: string;
    tooltip?: string;
  }[];
  details?: Detail[];
  blocks?: Block[];
};

export default function ObjectListItem({
  spaceId,
  objectId,
  icon,
  title,
  subtitle,
  accessories,
  details,
  blocks,
}: ObjectListItemProps) {
  return (
    <List.Item
      title={title}
      subtitle={
        subtitle
          ? { value: subtitle.value, tooltip: subtitle.tooltip }
          : undefined
      }
      icon={typeof icon === "string" ? { source: icon } : icon}
      accessories={accessories?.map((accessory) => {
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
      })}
      actions={
        <ActionPanel title={title}>
          {details && blocks ? (
            <>
              <Action.Push
                title="Open Object Details"
                target={
                  <ObjectDetail
                    title={title}
                    details={details}
                    blocks={blocks}
                  />
                }
              />
              <Action.OpenInBrowser
                icon={{ source: "../assets/anytype-icon.png" }}
                title="Open in Anytype"
                url={`anytype://object?objectId=${objectId}&spaceId=${spaceId}`}
              />
            </>
          ) : (
            <Action.OpenInBrowser
              icon={{ source: "../assets/anytype-icon.png" }}
              title="Open in Anytype"
              url={`anytype://object?objectId=${objectId}&spaceId=${spaceId}`}
            />
          )}
        </ActionPanel>
      }
    />
  );
}
