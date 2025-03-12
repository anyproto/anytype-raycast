import { Icon } from "@raycast/api";
import { DisplaySpace, Space } from "../models";
import { getFile } from "../utils";

/**
 * Map raw `Space` objects from the API into display-ready data (e.g., icon).
 * @param spaces Raw `Space` objects from the API.
 * @returns Display-ready `Space` objects.
 */
export async function mapSpaces(spaces: Space[]): Promise<DisplaySpace[]> {
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
export async function mapSpace(space: Space): Promise<DisplaySpace> {
  const icon =
    space.icon.format === "file" && space.icon.file ? (await getFile(space.icon.file)) || Icon.BullsEye : Icon.BullsEye;

  return {
    ...space,
    name: space.name || "Untitled",
    icon,
  };
}
