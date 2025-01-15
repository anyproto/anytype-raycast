import { SpaceObject, Detail, Member } from "../schemas";
import { getIconWithFallback } from "../icon";

/**
 * Map raw `SpaceObject` items into display-ready data, including details, icons, etc.
 */
export async function mapObjects(objects: SpaceObject[]): Promise<SpaceObject[]> {
  return Promise.all(
    objects.map(async (object) => {
      const getDetail = (id: string): Detail["details"] | undefined =>
        object.details?.find((detail) => detail.id === id)?.details;

      // Resolve object icon
      const icon = await getIconWithFallback(object.icon, object.layout);

      // Extract 'created' details
      const createdDateString = getDetail("createdDate")?.createdDate as string;
      const createdDate = createdDateString ? new Date(createdDateString) : new Date(0);
      const createdByDetails = getDetail("createdBy")?.details as Member;
      const createdBy = {
        name: createdByDetails?.name || "Unknown",
        icon: await getIconWithFallback(createdByDetails?.icon || "", "participant"),
        globalName: createdByDetails?.global_name || "",
      };

      // Extract 'last modified' details
      const lastModifiedDateString = getDetail("lastModifiedDate")?.lastModifiedDate as string;
      const lastModifiedDate = lastModifiedDateString ? new Date(lastModifiedDateString) : new Date(0);
      const lastModifiedByDetails = getDetail("lastModifiedBy")?.details as Member;
      const lastModifiedBy = {
        name: lastModifiedByDetails?.name || "Unknown",
        icon: await getIconWithFallback(lastModifiedByDetails?.icon || "", "participant"),
        globalName: lastModifiedByDetails?.global_name || "",
      };

      return {
        ...object,
        icon,
        name: object.name || "Untitled",
        object_type: object.object_type || "Unknown Type",
        details: object.details.map((detail) => {
          const { id, details } = detail;

          return {
            ...detail,
            details: {
              ...details,
              ...(id === "createdDate" && { createdDate: createdDate.toISOString() }),
              ...(id === "createdBy" && { createdBy }),
              ...(id === "lastModifiedDate" && { lastModifiedDate: lastModifiedDate.toISOString() }),
              ...(id === "lastModifiedBy" && { lastModifiedBy }),
            },
          };
        }),
      };
    }),
  );
}
