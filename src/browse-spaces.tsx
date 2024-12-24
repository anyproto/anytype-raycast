import { List, Image } from "@raycast/api";
import { useState } from "react";
import ObjectSpaceListItem from "./components/ObjectSpaceListItem";
import { useSpaces } from "./hooks/useSpaces";
import { pluralize } from "./utils/helpers";

export default function Command() {
  const { spaces, isLoadingSpaces } = useSpaces();
  const [searchText, setSearchText] = useState("");

  const filteredSpaces = spaces?.filter((space) =>
    space.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <List
      isLoading={isLoadingSpaces}
      searchBarPlaceholder="Search spaces..."
      onSearchTextChange={setSearchText}
    >
      <List.Section
        title={searchText ? "Search Results" : "All Spaces"}
        subtitle={pluralize(filteredSpaces?.length || 0, "space", {
          withNumber: true,
        })}
      >
        {filteredSpaces?.map((space) => (
          <ObjectSpaceListItem
            space={space}
            key={space.id}
            icon={{
              source: space.icon,
              mask: Image.Mask.RoundedRectangle,
            }}
          />
        ))}
      </List.Section>
    </List>
  );
}
