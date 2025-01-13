import { SpaceObject } from "../schemas";
import { getIconForObject } from "../icon";

/**
 * Map raw `SpaceObject` items into display-ready data, including details, icons, etc.
 */
export async function mapObjects(objects: SpaceObject[]): Promise<SpaceObject[]> {
  return Promise.all(
    objects.map(async (object) => {
      // Convert internal timestamps to JS dates
      const lastModified = object.details?.find((d) => d.id === "lastModifiedDate")?.details.lastModifiedDate as string;
      const lastModifiedDate = lastModified ? new Date(parseInt(lastModified) * 1000) : new Date(0);
      const created = object.details?.find((d) => d.id === "createdDate")?.details.createdDate as string;
      const createdDate = created ? new Date(parseInt(created) * 1000) : new Date(0);

      // Fetch icon
      const fetchedIcon = await getIconForObject(object);
      const icon = typeof fetchedIcon === "string" ? fetchedIcon : fetchedIcon.source;

      return {
        ...object,
        icon,
        name: object.name || "Untitled",
        object_type: object.object_type || "Unknown Type",
        details: object.details.map((detail) => ({
          ...detail,
          details: {
            ...detail.details,
            lastModifiedDate: lastModifiedDate.toISOString(),
            createdDate: createdDate.toISOString(),
          },
        })),
      };
    }),
  );
}
