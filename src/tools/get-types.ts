import { getTypes } from "../api/getTypes";
import { apiLimit } from "../helpers/constants";

type Input = {
  /* The ID of the space to get the types from */
  spaceId: string;
};

export default async function tool({ spaceId }: Input) {
  const response = await getTypes(spaceId, { offset: 0, limit: apiLimit });
  return response.types.map(({ object, name, id, unique_key }) => ({ object, name, id, unique_key }));
}
