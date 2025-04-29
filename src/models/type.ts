import { Image } from "@raycast/api";
import { ObjectIcon, Property, PropertyLink } from ".";

export enum ObjectLayout {
  Basic = "basic",
  Profile = "profile",
  Todo = "todo",
  Note = "note",
  Bookmark = "bookmark",
  Set = "set",
  Collection = "collection",
  Participant = "participant",
}

export enum TypeLayout {
  Basic = "basic",
  Profile = "profile",
  Todo = "todo",
  Note = "note",
}

export interface CreateTypeRequest {
  name: string;
  plural_name: string;
  icon: string;
  Layout: TypeLayout;
  Properties: PropertyLink[];
}

export interface UpdateTypeRequest {
  name?: string;
  plural_name?: string;
  icon?: string;
  layout?: TypeLayout;
  properties?: PropertyLink[];
}

export interface RawType {
  object: string;
  id: string;
  key: string;
  name: string;
  icon: ObjectIcon;
  layout: ObjectLayout;
  archived: boolean;
  properties: Property[];
}

export interface Type extends Omit<RawType, "icon"> {
  icon: Image.ImageLike;
}
