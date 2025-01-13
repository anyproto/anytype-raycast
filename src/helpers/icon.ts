import { Icon } from "@raycast/api";
import fetch from "node-fetch";
import { SpaceObject } from "./schemas";

/**
 * Fetch an icon from local Anytype server and return it as a base64 data URI.
 */
export async function fetchAndTransformIcon(iconUrl: string): Promise<string | undefined> {
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

/**
 * Fetch an icon, respecting a given timeout (in milliseconds).
 */
export async function fetchWithTimeout(url: string, timeout: number): Promise<string | undefined> {
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
    console.error("Failed to fetch icon with timeout:", error);
  }

  return undefined;
}

/**
 * Determine which icon to show for a given Object.
 */
export async function getIconForObject(object: SpaceObject): Promise<{ source: string } | Icon> {
  if (object.icon) {
    // If the icon is served by local server, attempt to fetch it and turn it into base64.
    if (object.icon.startsWith("http://127.0.0.1")) {
      const fetchedIcon = await fetchWithTimeout(object.icon, 500);
      if (fetchedIcon) {
        return { source: fetchedIcon };
      }
    } else {
      return { source: object.icon };
    }
  }

  // Fallback icons by layout
  switch (object.layout) {
    case "todo":
      return Icon.CheckCircle;
    case "set":
    case "collection":
      return Icon.List;
    case "participant":
      return Icon.PersonCircle;
    case "bookmark":
      return Icon.Bookmark;
    default:
      return Icon.Document;
  }
}
