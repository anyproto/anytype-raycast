import { Icon, Image, getPreferenceValues } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { format } from "date-fns";
import { getMaskForObject } from "./icon";
import { Member, SpaceObject, Type } from "./schemas";
import { getDateLabel, getShortDateLabel } from "./strings";

export function processObject(
  object: SpaceObject,
  isPinned: boolean,
  mutateObjects: MutatePromise<SpaceObject[] | Type[] | Member[]>,
  mutatePinnedObjects?: MutatePromise<SpaceObject[] | Type[] | Member[]>,
): {
  key: string;
  spaceId: string;
  id: string;
  icon: { source: string; mask: Image.Mask };
  title: string;
  subtitle: { value: string; tooltip: string };
  accessories: { icon?: Icon; date?: Date; tooltip: string; text?: string }[];
  mutate: MutatePromise<SpaceObject[] | Type[] | Member[]>[];
  layout: string;
  isPinned: boolean;
} {
  const dateToSortAfter = getPreferenceValues().sort;
  const date = object.details.find((detail) => detail.id === dateToSortAfter)?.details[dateToSortAfter] as string;
  const hasValidDate = date && new Date(date).getTime() !== 0;

  return {
    key: object.id,
    spaceId: object.space_id,
    id: object.id,
    icon: {
      source: object.icon,
      mask: getMaskForObject(object.layout, object.icon),
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
    mutate: [mutateObjects, mutatePinnedObjects].filter(Boolean) as MutatePromise<SpaceObject[] | Type[] | Member[]>[],
    layout: object.layout,
    isPinned,
  };
}
