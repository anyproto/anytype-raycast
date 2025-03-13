import { Image } from "@raycast/api";
import { ObjectIcon } from "./icon";

export interface Type {
  object: string;
  id: string;
  unique_key: string;
  name: string;
  icon: ObjectIcon;
  recommended_layout: string;
}

export interface DisplayType extends Omit<Type, "icon"> {
  icon: string | { source: string; tintColor?: { light: string; dark: string }; mask?: Image.Mask };
}
