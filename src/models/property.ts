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
  name: string;
}

export interface Property {
  object: string;
  id: string;
  key: string;
  name: string;
  format: PropertyFormat;
  icon: Image.ImageLike; // TODO
}

export interface RawPropertyWithValue {
  id: string;
  key: string;
  name: string;
  format: PropertyFormat;
  text?: string;
  number?: number;
  select?: RawTag;
  multi_select?: RawTag[];
  date?: string;
  files?: string[];
  checkbox?: boolean;
  url?: string;
  email?: string;
  phone?: string;
  objects?: string[];
}

export interface PropertyWithValue extends Omit<RawPropertyWithValue, "select" | "multi_select" | "files" | "objects"> {
  select?: Tag;
  multi_select?: Tag[];
  files?: SpaceObject[];
  objects?: SpaceObject[];
}

export interface PropertyLink {
  key: string;
  name: string;
  format: PropertyFormat;
}

export interface PropertyLinkWithValue {
  key: string;
  text?: string;
  number?: number;
  select?: string;
  multi_select?: string[];
  date?: string;
  files?: string[];
  checkbox?: boolean;
  url?: string;
  email?: string;
  phone?: string;
  objects?: string[];
}
