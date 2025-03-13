import { Image } from "@raycast/api";
import { ObjectIcon } from "./icon";

export interface Template {
  object: string;
  id: string;
  name: string;
  icon: ObjectIcon;
}

export interface DisplayTemplate extends Omit<Template, "icon"> {
  icon: string | { source: string; tintColor?: { light: string; dark: string }; mask?: Image.Mask };
}
