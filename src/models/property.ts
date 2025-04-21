import { Image } from "@raycast/api";
import { Color } from ".";
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
  select?: Tag;
  multi_select?: Tag[];
  date?: string;
  files?: SpaceObject[];
  checkbox?: boolean;
  url?: string;
  email?: string;
  phone?: string;
  objects?: SpaceObject[];
}

export interface Property extends RawProperty {
  icon: Image.ImageLike;
}

export interface Tag {
  id: string;
  name: string;
  color: Color | string;
}
