import { getIconWithFallback } from "../helpers/icon";
import { DisplayType, Type } from "../helpers/schema";

/**
 * Map raw `Type` objects from the API into display-ready data (e.g., icon).
 */
export async function mapTypes(types: Type[]): Promise<DisplayType[]> {
  return Promise.all(
    types.map(async (type) => {
      return mapType(type);
    }),
  );
}

/**
 * Map raw `Type` object from the API into display-ready data (e.g., icon).
 */
export async function mapType(type: Type): Promise<DisplayType> {
  const icon = await getIconWithFallback(type.icon, "type");

  return {
    ...type,
    name: type.name.trim() || "Untitled", // empty string comes as \n
    icon: icon,
  };
}
