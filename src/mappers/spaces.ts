import { Icon } from "@raycast/api";
import { getIcon } from "../helpers/icon";
import { Space } from "../helpers/schemas";

/**
 * Map raw `Space` objects from the API into display-ready data (e.g., icon).
 */
export async function mapSpaces(spaces: Space[]): Promise<Space[]> {
  return Promise.all(
    spaces.map(async (space) => {
      const icon = (await getIcon(space.icon)) || Icon.BullsEye;
      return {
        ...space,
        name: space.name || "Untitled",
        icon,
      };
    }),
  );
}
