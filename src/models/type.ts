import { Image } from "@raycast/api";
import { ObjectIcon } from ".";

export interface RawType {
  object: string;
  id: string;
  key: string;
  name: string;
  icon: ObjectIcon;
  layout: string;
  archived: boolean;
  properties: string[];
}

export interface Type extends Omit<RawType, "icon"> {
  icon: Image.ImageLike;
}
