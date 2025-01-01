import { List, Image, Toast, showToast } from "@raycast/api";
import { useState, useEffect, useMemo, useRef } from "react";
import SpaceListItem from "./components/SpaceListItem";
import { useSpaces } from "./hooks/useSpaces";
import { getMembers } from "./api/getMembers";
import { pluralize } from "./utils/helpers";

export default function BrowseSpaces() {
  const { spaces, spacesError, isLoadingSpaces } = useSpaces();
  const [searchText, setSearchText] = useState("");
  const membersDataRef = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    if (spaces) {
      const fetchMembersData = async () => {
        const data: { [key: string]: number } = {};
        const spaceIds = spaces.map((space) => space.id);
        const uniqueSpaceIds = spaceIds.filter((id) => !(id in membersDataRef.current));

        await Promise.all(
          uniqueSpaceIds.map(async (id) => {
            try {
              const response = await getMembers(id, {
                offset: 0,
                limit: 1,
              });
              data[id] = response.pagination.total;
            } catch (error) {
              if (error instanceof Error) {
                showToast(Toast.Style.Failure, "Failed to fetch members", error.message);
              } else {
                showToast(Toast.Style.Failure, "Failed to fetch members", "An unknown error occurred.");
              }
            }
          }),
        );

        membersDataRef.current = { ...membersDataRef.current, ...data };
      };
      fetchMembersData();
    }
  }, [spaces]);

  const isLoadingMembers = useMemo(
    () => Object.keys(membersDataRef.current).length !== spaces?.length,
    [membersDataRef.current, spaces],
  );

  const filteredSpaces = spaces?.filter((space) => space.name.toLowerCase().includes(searchText.toLowerCase()));

  if (spacesError) {
    showToast(Toast.Style.Failure, "Failed to fetch spaces", spacesError.message);
  }

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
          const memberCount = membersDataRef.current[space.id] || 0;
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
