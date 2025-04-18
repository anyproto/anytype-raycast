import { Tag } from "../models";
import { colorMap } from "../utils";

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
