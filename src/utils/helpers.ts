import { Icon } from "@raycast/api";
import fetch from "node-fetch";
import {
  SPACE_ICON,
  SPACE_MEMBER_ICON,
  SPACE_OBJECT_ICON,
  TYPE_ICON,
  LIST_ICON,
  BOOKMARK_ICON,
} from "./constants";
import { Space, SpaceObject, Member, Type } from "./schemas";

export async function transformSpace(spaces: Space[]): Promise<Space[]> {
  return Promise.all(
    spaces.map(async (space) => {
      const icon = (await fetchAndTransformIcon(space.icon)) || SPACE_ICON;
      return {
        ...space,
        name: space.name || "Untitled",
        icon: icon,
      };
    }),
  );
}

export async function transformMembers(members: Member[]): Promise<Member[]> {
  return Promise.all(
    members.map(async (member) => {
      const icon =
        (await fetchAndTransformIcon(member.icon)) || SPACE_MEMBER_ICON;
      return {
        ...member,
        icon: icon,
      };
    }),
  );
}

export async function transformTypes(types: Type[]): Promise<Type[]> {
  return Promise.all(
    types.map(async (objectType) => {
      return {
        ...objectType,
        icon: objectType.icon || TYPE_ICON,
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
  object: SpaceObject,
): Promise<{ source: string } | Icon> {
  if (object.icon) {
    if (object.icon.startsWith("http://127.0.0.1")) {
      const fetchedIcon = await fetchWithTimeout(object.icon, 500);
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
      return LIST_ICON;
    case "participant":
      return SPACE_MEMBER_ICON;
    case "bookmark":
      return BOOKMARK_ICON;
    default:
      return SPACE_OBJECT_ICON;
  }
}

// timeout in milliseconds
async function fetchWithTimeout(
  url: string,
  timeout: number,
): Promise<string | undefined> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (response.ok) {
      const iconData = await response.arrayBuffer();
      return `data:image/png;base64,${Buffer.from(iconData).toString("base64")}`;
    }
  } catch (error) {
    console.error("Failed to fetch and transform icon with timeout:", error);
  }
  return undefined;
}

export async function transformObjects(
  objects: SpaceObject[],
): Promise<SpaceObject[]> {
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
