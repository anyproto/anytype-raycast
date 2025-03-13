import { getPreferenceValues, Icon } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { format } from "date-fns";
import { DisplayMember, DisplayObject, DisplayType } from "../models";
import { getDateLabel, getShortDateLabel } from "../utils";

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
    icon: object.icon,
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
