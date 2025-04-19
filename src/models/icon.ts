export enum IconFormat {
  Emoji = "emoji",
  File = "file",
  Icon = "icon",
}

export enum Color {
  Grey = "grey",
  Yellow = "yellow",
  Orange = "orange",
  Red = "red",
  Pink = "pink",
  Purple = "purple",
  Blue = "blue",
  Ice = "ice",
  Teal = "teal",
  Lime = "lime",
}

export interface ObjectIcon {
  format: IconFormat;
  emoji?: string;
  file?: string;
  name?: string;
  color?: Color | string;
}
