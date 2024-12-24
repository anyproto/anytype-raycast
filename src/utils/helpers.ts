import { Icon } from "@raycast/api";
import fetch from "node-fetch";
import * as S from "./schemas";
import * as C from "./constants";

export async function transformSpace(spaces: S.Space[]): Promise<S.Space[]> {
  return Promise.all(
    spaces.map(async (space) => {
      const icon = (await fetchAndTransformIcon(space.icon)) || C.SPACE_ICON;
      return {
        ...space,
        name: space.name || "Untitled",
        icon: icon,
      };
    }),
  );
}

export async function transformMembers(
  members: S.Member[],
): Promise<S.Member[]> {
  return Promise.all(
    members.map(async (member) => {
      const icon =
        (await fetchAndTransformIcon(member.icon)) || C.SPACE_MEMBER_ICON;
      return {
        ...member,
        icon: icon,
      };
    }),
  );
}

export async function transformObjectTypes(
  types: S.ObjectType[],
): Promise<S.ObjectType[]> {
  return Promise.all(
    types.map(async (objectType) => {
      return {
        ...objectType,
        icon: objectType.icon || C.OBJECT_TYPE_ICON,
      };
    }),
  );
}

async function fetchAndTransformIcon(
  iconUrl: string,
): Promise<string | undefined> {
  if (iconUrl && iconUrl.startsWith("http://127.0.0.1")) {
    try {
      const response = await fetch(iconUrl);
      if (response.ok) {
        const iconData = await response.arrayBuffer();
        return `data:image/png;base64,${Buffer.from(iconData).toString("base64")}`;
      }
    } catch (error) {
      console.error("Failed to fetch and transform icon:", error);
    }
  }
  return undefined;
}

export async function getIconForObject(
  object: S.SpaceObject,
): Promise<{ source: string } | Icon> {
  if (object.icon) {
    if (object.icon.startsWith("http://127.0.0.1")) {
      const fetchedIcon = await fetchAndTransformIcon(object.icon);
      if (fetchedIcon) {
        return { source: fetchedIcon };
      }
    } else {
      return { source: object.icon };
    }
  }

  switch (object.type) {
    case "set":
    case "collection":
      return C.LIST_ICON;
    case "participant":
      return C.SPACE_MEMBER_ICON;
    case "bookmark":
      return C.BOOKMARK_ICON;
    default:
      return C.SPACE_OBJECT_ICON;
  }
}

export async function transformObjects(
  objects: S.SpaceObject[],
): Promise<S.SpaceObject[]> {
  return Promise.all(
    objects.map(async (object) => {
      const lastModified = object.details?.find(
        (d) => d.id === "lastModifiedDate",
      )?.details.lastModifiedDate;
      const date = lastModified
        ? new Date(parseInt(lastModified) * 1000)
        : new Date(0);
      const icon = await getIconForObject(object);
      return {
        ...object,
        icon: typeof icon === "string" ? icon : icon.source,
        name: object.name || "Untitled",
        object_type: object.object_type || "Unknown Type",
        details: object.details.map((detail) => ({
          ...detail,
          details: {
            ...detail.details,
            lastModifiedDate: date.toISOString(),
          },
        })),
      };
    }),
  );
}

export function pluralize(
  count: number,
  noun: string,
  {
    suffix = "s",
    withNumber = false,
  }: { suffix?: string; withNumber?: boolean } = {},
): string {
  const pluralizedNoun = `${noun}${count !== 1 ? suffix : ""}`;
  return withNumber ? `${count} ${pluralizedNoun}` : pluralizedNoun;
}
