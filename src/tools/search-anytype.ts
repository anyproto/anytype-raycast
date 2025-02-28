import { globalSearch } from "../api/globalSearch";
import { apiLimit } from "../helpers/constants";

type Input = {
  /* The title of the page to search for. Only use plain text: it doesn't support any operators */
  query: string;
};

export default async function tool({ query }: Input) {
  const types: string[] = [];
  const response = await globalSearch(
    { query, types, sort: { direction: "desc", timestamp: "created_date" } },
    { offset: 0, limit: apiLimit },
  );
  return response.data.map(({ object, name, id, snippet, icon }) => {
    const result = { object, name, id, snippet };
    if (icon && icon.length === 1) {
      return { ...result, icon };
    }
    return result;
  });
}
