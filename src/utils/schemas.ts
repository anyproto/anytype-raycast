export interface Pagination {
  total: number;
  offset: number;
  limit: number;
  has_next: boolean;
}

export interface SpaceResponse {
  spaces: Space[];
  pagination: Pagination;
}

export interface Space {
  type: string;
  id: string;
  name: string;
  icon: string;
  home_object_id: string;
  archive_object_id: string;
  profile_object_id: string;
  marketplace_workspace_id: string;
  device_id: string;
  account_space_id: string;
  widgets_id: string;
  space_view_id: string;
  tech_space_id: string;
  timezone: string;
  network_id: string;
  members: Member[];
}

export interface MemberResponse {
  members: Member[];
  pagination: Pagination;
}

export interface Member {
  type: string;
  id: string;
  name: string;
  icon: string;
  identity: string;
  global_name: string;
  role: string;
}

export interface ObjectResponse {
  objects: SpaceObject[];
  pagination: Pagination;
}

export interface SpaceObject {
  type: string;
  id: string;
  name: string;
  icon: string;
  object_type: string;
  space_id: string;
  root_id: string;
  blocks: Block[];
  details: {
    id: string;
    details: {
      lastModifiedDate: string;
    };
  }[];
}

export interface Block {
  id: string;
  children_ids: string[];
  background_color: string;
  align: string;
  vertical_align: string;
  layout: Layout;
  text: Text;
  file: File;
}

export interface Layout {
  style: string;
}

export interface Text {
  text: string;
  style: string;
  checked: boolean;
  color: string;
  icon: string;
  icon_image: string;
}

export interface File {
  hash: string;
  name: string;
  type: string;
  mime: string;
  size: number;
  added_at: number;
  target_object_id: string;
  state: number;
  style: number;
}

export interface Detail {
  id: string;
  details: {
    [key: string]: unknown;
  };
}

export interface TypesResponse {
  objectTypes: Type[];
  pagination: Pagination;
}

export interface Type {
  type: string;
  id: string;
  unique_key: string;
  name: string;
  icon: string;
}

export interface TemplatesResponse {
  templates: Template[];
  pagination: Pagination;
}

export interface Template {
  type: string;
  id: string;
  name: string;
  icon: string;
}

export interface ChatMessage {
  type: string;
  id: string;
  order_id: string;
  creator: string;
  created_at: number;
  modified_at: number;
  reply_to_message_id: string;
  message: MessageContent;
  attachments: Attachment[];
  reactions: Reactions;
}

export interface MessageContent {
  text: string;
  style: string;
  marks: string[];
}

export interface Attachment {
  target: string;
  type: string;
}

export interface Reactions {
  reactions: { [emoji: string]: IdentityList };
}

export interface IdentityList {
  ids: string[];
}
