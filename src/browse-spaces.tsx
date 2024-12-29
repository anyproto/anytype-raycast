import { List, Image } from "@raycast/api";
import { useState, useEffect, useMemo } from "react";
import SpaceListItem from "./components/SpaceListItem";
import { useSpaces } from "./hooks/useSpaces";
import { getMembers } from "./api/getMembers";
import { pluralize } from "./utils/helpers";

export default function BrowseSpaces() {
  const { spaces, isLoadingSpaces } = useSpaces();
  const [searchText, setSearchText] = useState("");
  const [membersData, setMembersData] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (spaces) {
      const fetchMembersData = async () => {
        const data: { [key: string]: number } = {};
        for (const space of spaces) {
          try {
            const response = await getMembers(space.id, {
              offset: 0,
              limit: 1,
            });
            data[space.id] = response.pagination.total;
          } catch (error) {
            console.error(
              `Failed to fetch members for space ${space.id}:`,
              error,
            );
          }
        }
        setMembersData(data);
      };
      fetchMembersData();
    }
  }, [spaces]);

  const isLoadingMembers = useMemo(
    () => Object.keys(membersData).length !== spaces?.length,
    [membersData, spaces],
  );

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
        {filteredSpaces?.map((space) => {
          const memberCount = membersData[space.id] || 0;
          return (
            <SpaceListItem
              space={space}
              key={space.id}
              icon={{
                source: space.icon,
                mask: Image.Mask.RoundedRectangle,
              }}
              memberCount={memberCount}
            />
          );
        })}
      </List.Section>
    </List>
  );
}
