import { Icon } from "@raycast/api";
import { Type } from "../helpers/schemas";

/**
 * Map raw `Type` objects from the API into display-ready data (e.g., icon).
 */
export async function mapTypes(types: Type[]): Promise<Type[]> {
  return Promise.all(
    types.map(async (type) => {
      return mapType(type);
    }),
  );
}

/**
 * Map raw `Type` object from the API into display-ready data (e.g., icon).
 */
export async function mapType(type: Type): Promise<Type> {
  return {
    ...type,
    name: type.name.trim() || "Untitled", // empty string comes as \n
    icon: type.icon || Icon.Lowercase,
  };
}
