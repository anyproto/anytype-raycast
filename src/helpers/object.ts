import { getPreferenceValues, Icon, Image } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { format } from "date-fns";
import { DisplayMember, DisplayObject, DisplayType } from "../models";
import { getDateLabel, getMaskForObject, getShortDateLabel } from "../utils";

export function processObject(
  object: DisplayObject,
  isPinned: boolean,
  mutateObjects: MutatePromise<DisplayObject[] | DisplayType[] | DisplayMember[]>,
  mutatePinnedObjects?: MutatePromise<DisplayObject[] | DisplayType[] | DisplayMember[]>,
) {
  const { sort } = getPreferenceValues();
  const dateProperty = object.properties.find((property) => property.id === sort);
  const date = dateProperty && dateProperty.date ? dateProperty.date : undefined;
  const hasValidDate = date && new Date(date).getTime() !== 0;

  return {
    key: object.id,
    spaceId: object.space_id,
    id: object.id,
    icon:
      typeof object.icon === "string"
        ? { source: object.icon, mask: getMaskForObject(object.icon, object.layout) }
        : (object.icon as { source: string; tintColor?: { light: string; dark: string }; mask?: Image.Mask }),
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
