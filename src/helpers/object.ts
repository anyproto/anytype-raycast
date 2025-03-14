import { getPreferenceValues, Icon } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { format } from "date-fns";
import { Member, SpaceObject, Type } from "../models";
import { getDateLabel, getShortDateLabel } from "../utils";

export function processObject(
  object: SpaceObject,
  isPinned: boolean,
  mutateObjects: MutatePromise<SpaceObject[] | Type[] | Member[]>,
  mutatePinnedObjects?: MutatePromise<SpaceObject[] | Type[] | Member[]>,
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
    dataview: object.blocks.find((block) => block.id === "dataview")?.dataview || undefined,
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
