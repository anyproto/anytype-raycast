import { Image } from "@raycast/api";
import { ObjectIcon, Property, PropertyEntry, RawProperty, RawType, Type } from ".";

export interface CreateObjectRequest {
  name: string;
  icon: ObjectIcon;
  body: string;
  source: string;
  template_id: string;
  type_key: string;
  properties: PropertyEntry[];
}

export interface UpdateObjectRequest {
  name: string;
  icon: ObjectIcon;
  Description: string;
  Properties: PropertyEntry[];
  // TODO: complete
}

export interface RawSpaceObject {
  object: string;
  id: string;
  name: string;
  icon: ObjectIcon;
  type: RawType;
  snippet: string;
  layout: string;
  space_id: string;
  archived: boolean;
  properties: RawProperty[];
}

export interface RawSpaceObjectWithBlocks extends RawSpaceObject {
  blocks: Block[];
}

export interface SpaceObject extends Omit<RawSpaceObject, "icon" | "type" | "properties"> {
  icon: Image.ImageLike;
  type: Type;
  properties: Property[];
}

export interface SpaceObjectWithBlocks extends Omit<RawSpaceObjectWithBlocks, "icon" | "type"> {
  type: Type;
  icon: Image.ImageLike;
}

export interface Block {
  id: string;
  children_ids: string[];
  background_color: string;
  align: string;
  vertical_align: string;
  text: Text;
  file: File;
  property: RawProperty;
}

export interface Text {
  text: string;
  style: string;
  checked: boolean;
  color: string;
  icon: ObjectIcon;
}

export interface File {
  hash: string;
  name: string;
  type: string;
  mime: string;
  size: number;
  added_at: number;
  target_object_id: string;
  state: string;
  style: string;
}
