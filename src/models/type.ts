import { Image } from "@raycast/api";
import { ObjectIcon, RawProperty } from ".";

export interface RawType {
  object: string;
  id: string;
  key: string;
  name: string;
  icon: ObjectIcon;
  layout: string;
  archived: boolean;
  properties: RawProperty[];
}

export interface Type extends Omit<RawType, "icon"> {
  icon: Image.ImageLike;
}
