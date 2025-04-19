import { Image } from "@raycast/api";
import { Property, PropertyFormat, RawProperty, Tag } from "../models";
import { colorMap, defaultTintColor } from "../utils";

export function mapProperties(properties: RawProperty[]): Property[] {
  return properties.map((property) => {
    return mapProperty(property);
  });
}

export function mapProperty(property: RawProperty): Property {
  return {
    ...property,
    name: property.name || "Untitled",
    icon: getIconForProperty(property.format),
  };
}

function getIconForProperty(format: PropertyFormat): Image.ImageLike {
  switch (format) {
    case PropertyFormat.Text:
      return { source: "icons/property/text.svg", tintColor: defaultTintColor };
    case PropertyFormat.Number:
      return { source: "icons/property/number.svg", tintColor: defaultTintColor };
    case PropertyFormat.Select:
      return { source: "icons/property/select.svg", tintColor: defaultTintColor };
    case PropertyFormat.MultiSelect:
      return { source: "icons/property/multiSelect.svg", tintColor: defaultTintColor };
    case PropertyFormat.Date:
      return { source: "icons/property/date.svg", tintColor: defaultTintColor };
    case PropertyFormat.File:
      return { source: "icons/property/file.svg", tintColor: defaultTintColor };
    case PropertyFormat.Checkbox:
      return { source: "icons/property/checkbox.svg", tintColor: defaultTintColor };
    case PropertyFormat.Url:
      return { source: "icons/property/url.svg", tintColor: defaultTintColor };
    case PropertyFormat.Email:
      return { source: "icons/property/email.svg", tintColor: defaultTintColor };
    case PropertyFormat.Phone:
      return { source: "icons/property/phone.svg", tintColor: defaultTintColor };
    case PropertyFormat.Object:
      return { source: "icons/property/object.svg", tintColor: defaultTintColor };
  }
}

export function mapTags(tags: Tag[]): Tag[] {
  return tags.map((tag) => {
    return mapTag(tag);
  });
}

export function mapTag(tag: Tag): Tag {
  return {
    ...tag,
    name: tag.name || "Untitled",
    color: colorMap[tag.color] || tag.color,
  };
}
