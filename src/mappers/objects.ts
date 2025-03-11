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
        icon: await getIconWithFallback(object.icon, object.layout, object.type),
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
  const icon = await getIconWithFallback(object.icon, object.layout, object.type);

  const mappedDetails = await Promise.all(
    object.details.map(async (detail) => {
      const { id, details } = detail;
      let mappedDetail: DetailData;

      switch (details.type) {
        case "text":
          mappedDetail = {
            type: "text",
            name: details.name,
            text: typeof details.text === "string" ? details.text.trim() : "",
          };
          break;
        case "number":
          mappedDetail = {
            type: "number",
            name: details.name,
            number: details.number !== undefined && details.number !== null ? details.number : 0,
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
        case "date":
          mappedDetail = {
            type: "date",
            name: details.name,
            date: details.date ? new Date(details.date).toISOString() : "",
          };
          break;
        case "file":
          mappedDetail = {
            type: "file",
            name: details.name,
            file: details.file ? await mapObjectWithoutDetails(object.space_id, details.file) : [],
          };

          break;
        case "checkbox":
          mappedDetail = {
            type: "checkbox",
            name: details.name,
            checkbox: details.checkbox || false,
          };
          break;
        case "url":
          mappedDetail = {
            type: "url",
            name: details.name,
            url: typeof details.url === "string" ? details.url.trim() : "",
          };
          break;
        case "email":
          mappedDetail = {
            type: "email",
            name: details.name,
            email: typeof details.email === "string" ? details.email.trim() : "",
          };
          break;
        case "phone":
          mappedDetail = {
            type: "phone",
            name: details.name,
            phone: typeof details.phone === "string" ? details.phone.trim() : "",
          };
          break;
        case "object":
          mappedDetail = {
            type: "object",
            name: details.name,
            object: details.object ? await mapObjectWithoutDetails(object.space_id, details.object) : [],
          };
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

export async function mapObjectWithoutDetails(spaceId: string, object: DisplayObject[]): Promise<DisplayObject[]> {
  const rawItems = Array.isArray(object) ? object : [object];
  return await Promise.all(
    rawItems.map(async (item) => {
      if (typeof item === "string") {
        const fetched = await getObjectWithoutMappedDetails(spaceId, item);
        if (!fetched) {
          throw new Error(`getRawObject returned null for item ${item}`);
        }
        return fetched;
      } else {
        return item;
      }
    }),
  );
}
