import { Image } from "@raycast/api";
import { ObjectIcon } from ".";

export interface CreateSpaceRequest {
  name: string;
}

export interface RawSpace {
  object: string;
  id: string;
  name: string;
  icon: ObjectIcon;
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

export interface Space extends Omit<RawSpace, "icon"> {
  icon: Image.ImageLike;
}
