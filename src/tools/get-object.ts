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
  // TODO: Implement in-memory markdown export
  return { spaceId, objectId };
}
