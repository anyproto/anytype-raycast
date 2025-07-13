import { Color, IconName, ObjectLayout, RawType, Type } from "../models";
import { getCustomTypeIcon, getIconWithFallback } from "../utils";

/**
 * Map raw `Type` objects from the API into display-ready data (e.g., icon).
 */
export async function mapTypes(types: RawType[]): Promise<Type[]> {
  return Promise.all(
    types.map(async (type) => {
      return mapType(type);
    }),
  );
}

/**
 * Map raw `Type` object from the API into display-ready data (e.g., icon).
 */
export async function mapType(type: RawType): Promise<Type> {
  // Handle deleted types
  if (!type || !type.id) {
    return {
      object: "type",
      id: "",
      key: "",
      name: "Deleted Type",
      plural_name: "Deleted Types",
      icon: getCustomTypeIcon(IconName.Warning, Color.Red),
      layout: ObjectLayout.Basic,
      archived: false,
      properties: [],
    };
  }

  const icon = await getIconWithFallback(type.icon, "type");

  return {
    ...type,
    name: type.name?.trim() || "Untitled", // empty string comes as \n
    plural_name: type.plural_name?.trim() || "Untitled",
    icon: icon,
  };
}
