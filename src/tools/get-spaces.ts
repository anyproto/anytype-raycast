import { getSpaces } from "../api/getSpaces";
import { apiLimit } from "../helpers/constants";

/**
 * Retrieve a list of spaces from the API.
 * This function queries all available spaces and returns a list of spaces.
 */
export default async function tool() {
  const { spaces, pagination } = await getSpaces({ offset: 0, limit: apiLimit });
  const results = spaces.map(({ object, name, id }) => ({ object, name, id }));

  return {
    results,
    pagination,
  };
}
