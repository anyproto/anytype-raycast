import { Image } from "@raycast/api";
import { ObjectIcon, Property } from ".";

export interface RawType {
  object: string;
  id: string;
  key: string;
  name: string;
  icon: ObjectIcon;
  layout: string;
  archived: boolean;
  properties: Property[];
}

export interface Type extends Omit<RawType, "icon"> {
  icon: Image.ImageLike;
}
