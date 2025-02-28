import { Tool } from "@raycast/api";
import { createObject } from "../api/createObject";
import { getSpace } from "../api/getSpace";
import { getType } from "../api/getType";

type Input = {
  /* The ID of the space where the object will be created. Required. */
  spaceId: string;

  /* The unique key representing the type of the object to be created. Required. */
  type_unique_key: string;

  /* The id representing type of the object to be created. */
  type_id: string;

  /* The name of the object to be created. Ask the user for this value. Required. */
  name: string;

  /* A single character representing the icon of the object. If not given, choose the most suitable emoji. */
  icon: string;

  /* A brief, single-line description of the object. If not given, set as an empty string. */
  description?: string;

  /* The main content of the object, supporting markdown syntax. If not given, set as an empty string. */
  body?: string;

  /* The URL of the bookmark, applicable when creating an object with type_unique_key='ot-bookmark'. Required if applicable. */
  source?: string;
};

export default async function tool({ spaceId, type_unique_key, name, icon, description, body, source }: Input) {
  const response = createObject(spaceId, {
    object_type_unique_key: type_unique_key,
    template_id: "", // not supported here
    name: name || "",
    icon: icon || "",
    description: description || "",
    body: body || "",
    source: source || "",
  });
  return response;
}

export const confirmation: Tool.Confirmation<Input> = async (input) => {
  const s = await getSpace(input.spaceId);
  const t = await getType(input.spaceId, input.type_id);
  return {
    message: `Are you sure you want to create an object with name "${input.name}"?`,
    info: [
      {
        name: "Space",
        value: s.space?.name || "",
      },
      {
        name: "Type",
        value: t.type?.name || "",
      },
      {
        name: "Name",
        value: input.name,
      },
      ...(input.icon !== undefined ? [{ name: "Icon", value: input.icon }] : []),
      ...(input.description !== undefined ? [{ name: "Description", value: input.description }] : []),
      ...(input.body !== undefined ? [{ name: "Body", value: input.body }] : []),
      ...(input.source !== undefined ? [{ name: "URL", value: input.source }] : []),
    ],
  };
};
