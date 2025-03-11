import { ObjectIcon } from "./icon";

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
