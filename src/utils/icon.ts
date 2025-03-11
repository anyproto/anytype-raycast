import { Icon, Image } from "@raycast/api";
import * as fs from "fs";
import fetch from "node-fetch";
import * as path from "path";
import { ObjectIcon, Type } from "../models";
import { colorMap, iconWidth } from "./constant";

/**
 * Determine which icon to show for a given Object. Icon can be url or emoji.
 * @param icon The icon of the object.
 * @param layout The layout of the object.
 * @param type The type of the object .
 * @returns The base64 data URI or Raycast Icon.
 */
export async function getIconWithFallback(icon: ObjectIcon, layout: string, type?: Type): Promise<string | Icon> {
  if (typeof icon === "object" && "name" in icon) {
    return await getCustomTypeIcon(icon.name, icon.color);
  }

  if (typeof icon === "object" && "file" in icon) {
    return (
      (await getFile(icon.file)) ||
      (typeof type?.icon === "object" && "name" in type.icon
        ? await getCustomTypeIcon(type.icon.name, "grey")
        : await getCustomTypeIcon("document", "grey"))
    );
  }

  if (typeof icon === "object" && "emoji" in icon && icon.emoji) {
    return icon.emoji;
  }

  if (typeof type?.icon === "object" && "name" in type.icon) {
    return await getCustomTypeIcon(type.icon.name, "grey");
  }

  switch (layout) {
    case "todo":
      return await getCustomTypeIcon("checkbox", "grey");
    case "set":
    case "collection":
      return await getCustomTypeIcon("layers", "grey");
    case "participant":
      return await getCustomTypeIcon("person", "grey");
    case "bookmark":
      return await getCustomTypeIcon("bookmark", "grey");
    case "type":
      return await getCustomTypeIcon("extension-puzzle", "grey");
    case "template":
      return await getCustomTypeIcon("copy", "grey");
    default:
      return await getCustomTypeIcon("document", "grey");
  }
}

/**
 * Retrieve a custom type icon by name from the local assets directory.
 * @param name The name of the icon file (without extension).
 * @param color The color of the icon.
 * @returns The base64 data URI of the icon.
 */
export async function getCustomTypeIcon(name: string, color?: string): Promise<string> {
  const iconDirectory = path.join(__dirname, "assets", "icons", "type");
  const iconPath = path.join(iconDirectory, `${name}.svg`);

  try {
    let svgContent = fs.readFileSync(iconPath, "utf8");
    svgContent = svgContent.replace(/fill="[^"]*"/g, "");

    if (color) {
      const fillColor = colorMap[color] ? colorMap[color] : colorMap.black;
      svgContent = svgContent.replace(/<svg([^>]*)>/, `<svg$1 fill="${fillColor}">`);
    }

    const base64Content = Buffer.from(svgContent).toString("base64");
    return `data:image/svg+xml;base64,${base64Content}`;
  } catch (error) {
    console.error(`Failed to read custom SVG icon: ${error}`);
    return "";
  }
}

/**
 * Fetch an icon from local gateway and return it as a base64 data URI.
 * @param iconUrl The URL of the icon.
 * @returns The base64 data URI of the icon or undefined.
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
 * @param url The URL of the icon.
 * @param timeout The timeout in milliseconds.
 * @returns The base64 data URI of the icon or undefined.
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
 * @param icon The icon of the object.
 * @param layout The layout of the object.
 * @returns The mask to use for the object.
 */
export function getMaskForObject(icon: string, layout: string): Image.Mask {
  return (layout === "participant" || layout === "profile") && icon != Icon.Document
    ? Image.Mask.Circle
    : Image.Mask.RoundedRectangle;
}
