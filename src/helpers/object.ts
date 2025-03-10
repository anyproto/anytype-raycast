import { Icon, Image, getPreferenceValues } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { format } from "date-fns";
import { getMaskForObject } from "./icon";
import { DisplayMember, DisplayObject, DisplayType } from "./schemas";
import { getDateLabel, getShortDateLabel } from "./strings";

export function processObject(
  object: DisplayObject,
  isPinned: boolean,
  mutateObjects: MutatePromise<DisplayObject[] | DisplayType[] | DisplayMember[]>,
  mutatePinnedObjects?: MutatePromise<DisplayObject[] | DisplayType[] | DisplayMember[]>,
): {
  key: string;
  spaceId: string;
  id: string;
  icon: { source: string; mask: Image.Mask };
  title: string;
  subtitle: { value: string; tooltip: string };
  accessories: { icon?: Icon; date?: Date; tooltip: string; text?: string }[];
  mutate: MutatePromise<DisplayObject[] | DisplayType[] | DisplayMember[]>[];
  layout: string;
  isPinned: boolean;
} {
  const { sort } = getPreferenceValues();
  const dateDetail = object.details.find((detail) => detail.id === sort);
  const date = dateDetail && "date" in dateDetail.details ? (dateDetail.details.date as string) : undefined;
  const hasValidDate = date && new Date(date).getTime() !== 0;

  return {
    key: object.id,
    spaceId: object.space_id,
    id: object.id,
    icon: {
      source: object.icon,
      mask: getMaskForObject(object.icon, object.layout),
    },
    title: object.name,
    subtitle: {
      value: object.type.name,
      tooltip: `Type: ${object.type.name}`,
    },
    accessories: [
      ...(isPinned ? [{ icon: Icon.Star, tooltip: "Pinned" }] : []),
      {
        date: hasValidDate ? new Date(date) : undefined,
        tooltip: hasValidDate
          ? `${getDateLabel()}: ${format(new Date(date), "EEEE d MMMM yyyy 'at' HH:mm")}`
          : `Never ${getShortDateLabel()}`,
        text: hasValidDate ? undefined : "—",
      },
    ],
    mutate: [mutateObjects, mutatePinnedObjects].filter(Boolean) as MutatePromise<
      DisplayObject[] | DisplayType[] | DisplayMember[]
    >[],
    layout: object.layout,
    isPinned,
  };
}
