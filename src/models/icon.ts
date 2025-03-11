export type ObjectIcon =
  | { type: "emoji"; emoji: string }
  | { type: "file"; file: string }
  | { type: "name"; name: string; color: string };
