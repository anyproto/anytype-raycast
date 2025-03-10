import { getPreferenceValues } from "@raycast/api";
import { getObjectWithoutMappedDetails } from "../api/getObject";
import { getIconWithFallback } from "../helpers/icon";
import { DetailData, DisplayObject, SpaceObject } from "../helpers/schemas";

/**
 * Efficiently map raw `SpaceObject` items to essential display-ready data.
 * Only includes necessary fields for list rendering for performance.
 */
export async function mapObjects(objects: SpaceObject[]): Promise<DisplayObject[]> {
  const { sort } = getPreferenceValues();

  return Promise.all(
    objects.map(async (object) => {
      return {
        ...object,
        icon: await getIconWithFallback(object.icon, object.layout),
        name: object.name || object.snippet || "Untitled",
        type: object.type || "Unknown Type",
        details: object.details?.filter((detail) => detail.id === sort) || [],
      };
    }),
  );
}

/**
 * Map raw `SpaceObject` item into display-ready data, including details, icons, etc.
 */
export async function mapObject(object: SpaceObject): Promise<DisplayObject> {
  const icon = await getIconWithFallback(object.icon, object.layout);

  const mappedDetails = await Promise.all(
    object.details.map(async (detail) => {
      const { id, details } = detail;
      let mappedDetail: DetailData;

      switch (details.type) {
        case "text":
          mappedDetail = {
            type: "text",
            name: details.name,
            text: details.text || "",
          };
          break;
        case "number":
          mappedDetail = {
            type: "number",
            name: details.name,
            number: details.number !== undefined && details.number !== null ? details.number : 0,
          };
          break;
        case "date":
          mappedDetail = {
            type: "date",
            name: details.name,
            date: details.date ? new Date(details.date).toISOString() : "",
          };
          break;
        case "checkbox":
          mappedDetail = {
            type: "checkbox",
            name: details.name,
            checkbox: details.checkbox || false,
          };
          break;
        case "select":
          mappedDetail = {
            type: "select",
            name: details.name,
            select: details.select,
          };
          break;
        case "multi_select":
          mappedDetail = {
            type: "multi_select",
            name: details.name,
            multi_select: details.multi_select,
          };
          break;
        case "object":
          if (details.object) {
            const rawItems = Array.isArray(details.object) ? details.object : [details.object];
            const fetchedItems = await Promise.all(
              rawItems.map(async (item) => {
                if (typeof item === "string") {
                  const fetched = await getObjectWithoutMappedDetails(object.space_id, item);
                  if (!fetched) {
                    throw new Error(`getRawObject returned null for detail id: ${id} and item ${item}`);
                  }
                  return fetched;
                } else {
                  return item;
                }
              }),
            );
            mappedDetail = {
              type: "object",
              name: details.name,
              object: fetchedItems,
            };
          } else {
            throw new Error(`Missing object for detail id: ${id}`);
          }
          break;
        default:
          mappedDetail = details;
          console.warn(`Unknown detail type: ${detail.details.type}`);
      }

      return {
        id,
        details: mappedDetail,
      };
    }),
  );

  return {
    ...object,
    icon,
    blocks: undefined, // remove blocks to improve performance
    name: object.name || object.snippet || "Untitled",
    type: object.type || "Unknown Type",
    details: mappedDetails,
  };
}
