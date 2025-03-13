import { Image } from "@raycast/api";
import { ObjectIcon } from "./icon";
import { Type } from "./type";

export interface CreateObjectRequest {
  object_type_unique_key: string;
  template_id: string;
  icon: string;
  name: string;
  description: string;
  body: string;
  source: string;
}

export interface SpaceObject {
  object: string;
  id: string;
  name: string;
  icon: ObjectIcon;
  type: Type;
  snippet: string;
  layout: string;
  space_id: string;
  root_id: string;
  blocks: Block[];
  properties: Property[];
}

export interface DisplayObject extends Omit<SpaceObject, "icon"> {
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

export interface Property {
  id: string;
  name: string;
  format: string;
  text?: string;
  number?: number;
  select?: Tag;
  multi_select?: Tag[];
  date?: string;
  file?: DisplayObject[];
  checkbox?: boolean;
  url?: string;
  email?: string;
  phone?: string;
  object?: DisplayObject[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}
