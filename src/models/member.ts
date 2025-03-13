import { Image } from "@raycast/api";
import { ObjectIcon } from "./icon";

export interface RawMember {
  object: string;
  id: string;
  name: string;
  icon: ObjectIcon;
  identity: string;
  global_name: string;
  role: string;
}

export interface Member extends Omit<RawMember, "icon"> {
  icon: Image.ImageLike;
}
