import { getSpaces } from "../api/getSpaces";
import { apiLimit } from "../helpers/constants";

export default async function tool() {
  const response = await getSpaces({ offset: 0, limit: apiLimit });
  return response.spaces.map(({ object, name, id }) => ({ object, name, id }));
}
