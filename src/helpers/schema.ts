import { Icon } from "@raycast/api";

export interface Pagination {
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface DisplayCodeResponse {
  challenge_id: string;
}

export interface TokenResponse {
  session_token: string;
  app_key: string;
}

export interface Space {
  object: string;
  id: string;
  name: string;
  icon: ObjectIcon | Icon;
  home_object_id: string;
  archive_object_id: string;
  profile_object_id: string;
  marketplace_workspace_id: string;
  workspace_object_id: string;
  device_id: string;
  account_space_id: string;
  widgets_id: string;
  space_view_id: string;
  tech_space_id: string;
  gateway_url: string;
  local_storage_path: string;
  timezone: string;
  analytics_id: string;
  network_id: string;
}

export interface DisplaySpace extends Omit<Space, "icon"> {
  icon: string;
}

export interface Member {
  object: string;
  id: string;
  name: string;
  icon: ObjectIcon;
  identity: string;
  global_name: string;
  role: string;
}

export interface DisplayMember extends Omit<Member, "icon"> {
  icon: string;
}

export interface ObjectExport {
  path: string;
}

export interface Export {
  markdown: string;
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
  blocks: Block[] | undefined;
  details: Detail[];
}

export interface DisplayObject extends Omit<SpaceObject, "icon"> {
  icon: string;
}

export type ObjectIcon =
  | { type: "emoji"; emoji: string }
  | { type: "file"; file: string }
  | { type: "name"; name: string; color: string };

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

export interface Type {
  object: string;
  id: string;
  unique_key: string;
  name: string;
  icon: ObjectIcon;
  recommended_layout: string;
}

export interface DisplayType extends Omit<Type, "icon"> {
  icon: string;
}

export interface Template {
  object: string;
  id: string;
  name: string;
  icon: ObjectIcon;
}

export interface DisplayTemplate extends Omit<Template, "icon"> {
  icon: string;
}

export interface CreateObjectRequest {
  object_type_unique_key: string;
  template_id: string;
  icon: string;
  name: string;
  description: string;
  body: string;
  source: string;
}

export interface SearchRequest {
  query: string;
  types: string[];
  sort?: SortOptions;
}

export interface SortOptions {
  direction: string; // "asc" or "desc"
  timestamp: string; // "created_date" or "last_modified_date" or "last_opened_date"
}
