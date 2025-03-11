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
  details: Detail[];
}

export interface DisplayObject extends Omit<SpaceObject, "icon"> {
  icon: string;
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

export interface Detail {
  id: string;
  details: DetailData;
}

export type DetailData =
  | { type: "text"; text: string; name: string } // text
  | { type: "number"; number: number; name: string } // integer
  | { type: "select"; select: Tag; name: string } // single select tag
  | { type: "multi_select"; multi_select: Tag[]; name: string } // multi-select tags
  | { type: "date"; date: string; name: string } // ISO 8601 date string
  | { type: "file"; file: DisplayObject[]; name: string } // file data
  | { type: "checkbox"; checkbox: boolean; name: string } // boolean
  | { type: "url"; url: string; name: string } // URL
  | { type: "email"; email: string; name: string } // email address
  | { type: "phone"; phone: string; name: string } // phone number
  | { type: "object"; object: DisplayObject[]; name: string }; // object data

export interface Tag {
  id: string;
  name: string;
  color: string;
}
