import { Tool } from "@raycast/api";
import { createObject } from "../api/createObject";
import { getSpace } from "../api/getSpace";
import { getType } from "../api/getType";

type Input = {
  /**
   * The unique identifier of the space to create the object in.
   * This value can be obtained from the `getSpaces` tool.
   */
  spaceId: string;

  /**
   * The unique key of the object type to create.
   * This value can be obtained from the `getTypes` tool.
   */
  type_unique_key: string;

  /**
   * The unique identifier of the object type to create.
   * This value can be obtained from the `getTypes` tool.
   */
  type_id: string;

  /**
   * The name of the object to create.
   * This value should be chosen based on the user's input.
   */
  name: string;

  /**
   * The icon of the object to create.
   * This value should be chosen based on the user's input.
   * If not given, choose the most suitable emoji.
   */
  icon: string;

  /**
   * The description of the object to create.
   * This value should be chosen based on the user's input.
   * If not given, set as an empty string.
   */
  description?: string;

  /**
   * The body of the object to create.
   * This value should be chosen based on the user's input and can include markdown syntax.
   */
  body?: string;

  /**
   * The URL of the bookmark, applicable when creating an object with type_unique_key='ot-bookmark'.
   * This value should be chosen based on the user's input.
   * If not given, set as an empty string.
   */
  source?: string;
};

/**
 * Create a new object in the specified space.
 * This function creates an object with the specified details in the specified space.
 * The object is created with the specified name, icon, description, body, and source (for bookmarks only).
 */
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
    message: `Are you sure you want to create the following object`,
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
