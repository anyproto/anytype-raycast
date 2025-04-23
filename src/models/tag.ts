import { Color } from ".";

export interface CreateTagRequest {
  name: string;
  color: Color;
}

export interface UpdateTagRequest {
  id: string;
  name: string;
  color?: Color;
}

export interface RawTag {
  id: string;
  name: string;
  color: Color;
}

export interface Tag extends Omit<RawTag, "color"> {
  color: string;
}
