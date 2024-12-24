import { List, Image } from "@raycast/api";
import { useState } from "react";
import { useSpaces } from "./hooks/useSpaces";
import { useMembers } from "./hooks/useMembers";
import ChatSpaceListItem from "./components/ChatSpaceListItem";
import { pluralize } from "./utils/helpers";

export default function Chat() {
  const { spaces, isLoadingSpaces } = useSpaces();
  const [searchText, setSearchText] = useState("");

  const membersData = spaces?.map((space) => useMembers(space.id));
  const isLoadingMembers = membersData?.some((data) => data.isLoadingMembers);

  const filteredSpaces = spaces?.filter((space) =>
    space.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <List
      isLoading={isLoadingSpaces || isLoadingMembers}
      searchBarPlaceholder="Search spaces..."
      onSearchTextChange={setSearchText}
    >
      <List.Section
        title={searchText ? "Search Results" : "All Spaces"}
        subtitle={pluralize(filteredSpaces?.length || 0, "space", {
          withNumber: true,
        })}
      >
        {filteredSpaces?.map((space, index) => {
          const { members } = membersData?.[index] || {};
          return (
            <ChatSpaceListItem
              space={space}
              key={space.id}
              icon={{
                source: space.icon,
                mask: Image.Mask.RoundedRectangle,
              }}
              members={members}
            />
          );
        })}
      </List.Section>
    </List>
  );
}
