import { Icon } from "@raycast/api";
import { getIcon } from "../helpers/icon";
import { Space } from "../helpers/schemas";

/**
 * Map raw `Space` objects from the API into display-ready data (e.g., icon).
 * @param spaces Raw `Space` objects from the API.
 * @returns Display-ready `Space` objects.
 */
export async function mapSpaces(spaces: Space[]): Promise<Space[]> {
  return Promise.all(
    spaces.map((space) => {
      return mapSpace(space);
    }),
  );
}

/**
 * Map raw `Space` object from the API into display-ready data (e.g., icon).
 * @param space Raw `Space` object from the API.
 * @returns Display-ready `Space` object.
 */
export async function mapSpace(space: Space): Promise<Space> {
  const icon = (await getIcon(space.icon)) || Icon.BullsEye;
  return {
    ...space,
    name: space.name || "Untitled",
    icon,
  };
}
