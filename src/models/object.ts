import { Image } from "@raycast/api";
import { ObjectIcon, RawType, Type } from ".";

export interface CreateObjectRequest {
  name: string;
  icon: ObjectIcon;
  description: string;
  body: string;
  source: string;
  template_id: string;
  type_key: string;
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
  root_id: string;
  archived: boolean;
  blocks: Block[];
  properties: Property[];
}

export interface SpaceObject extends Omit<RawSpaceObject, "icon" | "type"> {
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
  property: Property;
  dataview: Dataview;
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

export interface Dataview {
  views: View[];
}

export interface View {
  id: string;
  name: string;
  layout: ViewLayout;
  filters: Filter[];
  sorts: Sort[];
}

export enum ViewLayout {
  Grid = "grid",
  List = "list",
  Gallery = "gallery",
  Kanban = "kanban",
  Calendar = "calendar",
  Graph = "graph",
}

export interface Filter {
  id: string;
  property_key: string;
  format: string;
  condition: string;
  value: string;
}

export interface Sort {
  id: string;
  property_key: string;
  format: string;
  sort_type: string;
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
  file?: SpaceObject[];
  checkbox?: boolean;
  url?: string;
  email?: string;
  phone?: string;
  object?: SpaceObject[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}
