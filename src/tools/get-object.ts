type Input = {
  /* The ID of the space to get the object from */
  spaceId: string;

  /* The ID of the object to get */
  objectId: string;
};

export default async function tool({ spaceId, objectId }: Input) {
  return { spaceId, objectId };
}
