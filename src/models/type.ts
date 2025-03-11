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
  icon: string;
}
