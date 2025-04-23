import { Image } from "@raycast/api";
import { RawTag, Tag } from ".";
import { SpaceObject } from "./object";

export enum PropertyFormat {
  Text = "text",
  Number = "number",
  Select = "select",
  MultiSelect = "multi_select",
  Date = "date",
  Files = "files",
  Checkbox = "checkbox",
  Url = "url",
  Email = "email",
  Phone = "phone",
  Objects = "objects",
}

export interface CreatePropertyRequest {
  name: string;
  format: PropertyFormat;
}

export interface UpdatePropertyRequest {
  id: string;
  name: string;
}

export interface RawProperty {
  id: string;
  key: string;
  name: string;
  format: PropertyFormat;
  text?: string;
  number?: number;
  select?: RawTag;
  multi_select?: RawTag[];
  date?: string;
  files?: SpaceObject[];
  checkbox?: boolean;
  url?: string;
  email?: string;
  phone?: string;
  objects?: SpaceObject[];
}

export interface Property extends Omit<RawProperty, "select" | "multi_select"> {
  icon: Image.ImageLike;
  select?: Tag;
  multi_select?: Tag[];
}
