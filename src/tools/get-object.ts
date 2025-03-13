import { getExport, getObject } from "../api";
import { ExportFormat } from "../models";

type Input = {
  /**
   * The unique identifier of the space to get the object from.
   * This value can be obtained from the `getSpaces` tool.
   */
  spaceId: string;

  /**
   * The unique identifier of the object to retrieve.
   * This value can be obtained from the `search-anytype` or `search-space` tools.
   */
  objectId: string;
};

/**
 * Retrieve a specific object from a space.
 * This function queries the specified space and returns the object
 * that matches the specified ID.
 */
export default async function tool({ spaceId, objectId }: Input) {
  const { object } = await getObject(spaceId, objectId);
  const { markdown } = await getExport(spaceId, objectId, ExportFormat.Markdown);

  if (!object) {
    return {
      markdown,
    };
  }

  const results = {
    id: object.id,
    name: object.name,
    spaceId: object.space_id,
    type: object.type,
    properties: object.properties,
  };

  return {
    results,
    markdown,
  };
}
