import { Icon, Image } from "@raycast/api";
import * as fs from "fs";
import fetch from "node-fetch";
import * as path from "path";
import { ObjectIcon } from "../helpers/schemas";
import { colorMap, iconWidth } from "./constants";

/**
 * Determine which icon to show for a given Object. Icon can be url or emoji.
 */
export async function getIconWithFallback(icon: ObjectIcon, layout: string): Promise<string | Icon> {
  if (typeof icon === "object" && "name" in icon) {
    return getCustomIcon(icon.name, icon.color);
  }

  if (typeof icon === "object" && "file" in icon) {
    return (await getFile(icon.file)) || "";
  }

  if (typeof icon === "object" && "emoji" in icon && icon.emoji) {
    return icon.emoji;
  }

  // Fallback icons by layout
  switch (layout) {
    case "todo":
      return Icon.CheckCircle;
    case "set":
    case "collection":
      return Icon.List;
    case "participant":
      return Icon.PersonCircle;
    case "bookmark":
      return Icon.Bookmark;
    case "type":
      return getCustomIcon("extension-puzzle", "grey");
    case "template":
      return getCustomIcon("copy", "grey");
    default:
      return Icon.Document;
  }
}

/**
 * Retrieve a custom icon by name from the local assets directory.
 * @param name The name of the icon file (without extension).
 * @param color The color of the icon.
 * @returns The base64 data URI of the icon.
 */
export async function getCustomIcon(name: string, color: string): Promise<string> {
  const iconDirectory = path.join(__dirname, "assets", "icons");
  const iconPath = path.join(iconDirectory, `${name}.svg`);

  try {
    const fillColor = color && colorMap[color] ? colorMap[color] : colorMap.grey;
    let svgContent = fs.readFileSync(iconPath, "utf8");
    // Remove any explicit fill attributes from all elements
    svgContent = svgContent.replace(/fill="[^"]*"/g, "");
    // Add a global fill attribute to the root <svg> element
    svgContent = svgContent.replace(/<svg([^>]*)>/, `<svg$1 fill="${fillColor}">`);

    const base64Content = Buffer.from(svgContent).toString("base64");
    return `data:image/svg+xml;base64,${base64Content}`;
  } catch (error) {
    console.error(`Failed to read custom SVG icon: ${error}`);
    return "";
  }
}

/**
 * Fetch an icon from local gateway and return it as a base64 data URI.
 */
export async function getFile(iconUrl: string): Promise<string | undefined> {
  if (iconUrl && iconUrl.startsWith("http://127.0.0.1")) {
    const urlWithWidth = `${iconUrl}?width=${iconWidth}`;
    return (await fetchWithTimeout(urlWithWidth, 500)) || undefined;
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
    console.log("Failed to fetch icon with timeout:", error);
  }

  return undefined;
}

/**
 * Determine which mask to use for a given Object.
 */
export function getMaskForObject(layout: string, icon: string): Image.Mask {
  return (layout === "participant" || layout === "profile") && icon != Icon.Document
    ? Image.Mask.Circle
    : Image.Mask.RoundedRectangle;
}
