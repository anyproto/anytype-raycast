import { getPreferenceValues } from "@raycast/api";
import { getIconWithFallback } from "../helpers/icon";
import { Member, SpaceObject } from "../helpers/schemas";

/**
 * Map raw `SpaceObject` item into display-ready data, including details, icons, etc.
 */
export async function mapObject(object: SpaceObject): Promise<SpaceObject> {
  const icon = await getIconWithFallback(object.icon, object.layout);

  const mappedDetails = await Promise.all(
    object.details.map(async (detail) => {
      const { id, details } = detail;
      let mappedDetail = { ...details };

      if (detail.details.type === "text" && details.text) {
        const textString = details.text as string;
        mappedDetail = {
          ...mappedDetail,
          text: textString,
        };
      }

      if (detail.details.type === "number" && details.number !== undefined && details.number !== null) {
        const numberString = details.number;
        mappedDetail = {
          ...mappedDetail,
          number: numberString,
        };
      }

      if (detail.details.type === "date" && details.date) {
        const dateString = details.date as string;
        mappedDetail = {
          ...mappedDetail,
          date: new Date(dateString).toISOString(),
        };
      }

      if (detail.details.type === "select" && details.select) {
        const selectDetails = details.select;
        mappedDetail = {
          ...mappedDetail,
          select: selectDetails,
        };
      }

      if (detail.details.type === "multi_select" && details.multi_select) {
        const multiSelectDetails = details.multi_select;
        mappedDetail = {
          ...mappedDetail,
          multi_select: multiSelectDetails,
        };
      }

      if (detail.details.type === "object" && details.object) {
        if (id === "created_by" || id === "last_modified_by") {
          const memberDetails = details.object as Member;
          mappedDetail = {
            ...mappedDetail,
            object: {
              name: memberDetails?.name || "Unknown",
              icon: await getIconWithFallback(memberDetails?.icon, "participant"),
              global_name: memberDetails?.global_name || "",
            } as Member,
          };
        } else {
          // TODO
          console.log("Object detail type not implemented:", id);
        }
      }

      return {
        ...detail,
        details: mappedDetail,
      };
    }),
  );

  return {
    ...object,
    icon,
    blocks: undefined, // remove blocks to improve performance, as they're not used in the UI
    name: object.name || object.snippet || "Untitled",
    type: object.type || "Unknown Type",
    details: mappedDetails,
  };
}

/**
 * Efficiently map raw `SpaceObject` items to essential display-ready data.
 * Only includes necessary fields for list rendering for performance.
 */
export async function mapObjects(objects: SpaceObject[]): Promise<SpaceObject[]> {
  return Promise.all(
    objects.map(async (object) => {
      return {
        ...object,
        icon: await getIconWithFallback(object.icon, object.layout),
        name: object.name || object.snippet || "Untitled",
        type: object.type || "Unknown Type",
        details: object.details?.filter((detail) => detail.id === getPreferenceValues().sort) || [],
      };
    }),
  );
}
