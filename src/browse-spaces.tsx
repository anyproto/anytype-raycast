import { Icon, Image, List, Toast, showToast } from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import { getMembers } from "./api/getMembers";
import EmptyViewSpace from "./components/EmptyViewSpace";
import EnsureAuthenticated from "./components/EnsureAuthenticated";
import SpaceListItem from "./components/SpaceListItem";
import { getCustomIcon } from "./helpers/icon";
import { DisplaySpace } from "./helpers/schemas";
import { pluralize } from "./helpers/strings";
import { usePinnedSpaces } from "./hooks/usePinnedSpaces";
import { useSpaces } from "./hooks/useSpaces";

const searchPlaceholder = "Search spaces...";

export default function Command() {
  return (
    <EnsureAuthenticated placeholder={searchPlaceholder} viewType="list">
      <BrowseSpaces />
    </EnsureAuthenticated>
  );
}

function BrowseSpaces() {
  const { spaces, spacesError, mutateSpaces, isLoadingSpaces, spacesPagination } = useSpaces();
  const { pinnedSpaces, pinnedSpacesError, isLoadingPinnedSpaces, mutatePinnedSpaces } = usePinnedSpaces();
  const [searchText, setSearchText] = useState("");
  const [membersData, setMembersData] = useState<{ [spaceId: string]: number }>({});
  const [customPersonIcon, setCustomPersonIcon] = useState<string | Icon>(Icon.PersonCircle);

  useEffect(() => {
    async function fetchCustomPersonIcon() {
      try {
        const icon = await getCustomIcon("person-circle");
        setCustomPersonIcon(icon);
      } catch (error) {
        console.error("Error fetching custom person icon", error);
      }
    }
    fetchCustomPersonIcon();
  }, []);

  useEffect(() => {
    if (!spaces) return;

    const fetchMembersData = async () => {
      const newData: { [key: string]: number } = {};

      const spaceIdsToFetch = spaces.map((space) => space.id).filter((id) => !(id in membersData));

      try {
        await Promise.all(
          spaceIdsToFetch.map(async (id) => {
            const response = await getMembers(id, { offset: 0, limit: 1 });
            newData[id] = response.pagination.total;
          }),
        );
        setMembersData((prev) => ({ ...prev, ...newData }));
      } catch (error) {
        showToast(
          Toast.Style.Failure,
          "Failed to fetch members",
          error instanceof Error ? error.message : "An unknown error occurred.",
        );
      }
    };

    fetchMembersData();
  }, [spaces]);

  const isLoadingMembers = useMemo(() => {
    if (!spaces) return true;
    return Object.keys(membersData).length !== spaces.length;
  }, [spaces, membersData]);

  useEffect(() => {
    if (spacesError) {
      showToast(Toast.Style.Failure, "Failed to fetch spaces", spacesError.message);
    }
  }, [spacesError]);

  useEffect(() => {
    if (pinnedSpacesError) {
      showToast(Toast.Style.Failure, "Failed to fetch pinned spaces", pinnedSpacesError.message);
    }
  }, [pinnedSpacesError]);

  const filteredSpaces = spaces?.filter((space) => space.name.toLowerCase().includes(searchText.toLowerCase()));
  const pinnedFiltered = pinnedSpaces
    ?.map((pin) => filteredSpaces.find((space) => space.id === pin.id))
    .filter(Boolean) as DisplaySpace[];
  const regularFiltered = filteredSpaces?.filter((space) => !pinnedFiltered?.includes(space));

  return (
    <List
      isLoading={isLoadingSpaces || isLoadingMembers || isLoadingPinnedSpaces}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder={searchPlaceholder}
      pagination={spacesPagination}
    >
      {pinnedFiltered.length > 0 && (
        <List.Section title="Pinned" subtitle={pluralize(pinnedFiltered.length, "space", { withNumber: true })}>
          {pinnedFiltered.map((space) => {
            const memberCount = membersData[space.id] || 0;
            return (
              <SpaceListItem
                key={space.id}
                space={space}
                icon={{ source: space.icon, mask: Image.Mask.RoundedRectangle }}
                accessories={[
                  { icon: Icon.Star, tooltip: "Pinned" },
                  {
                    icon: { source: customPersonIcon, tintColor: { light: "black", dark: "white" } },
                    text: memberCount.toString(),
                    tooltip: `Members: ${memberCount}`,
                  },
                ]}
                mutate={[mutateSpaces, mutatePinnedSpaces]}
                isPinned={true}
              />
            );
          })}
        </List.Section>
      )}
      {regularFiltered.length > 0 ? (
        <List.Section
          title={searchText ? "Search Results" : "All Spaces"}
          subtitle={pluralize(regularFiltered.length, "space", { withNumber: true })}
        >
          {regularFiltered.map((space) => {
            const memberCount = membersData[space.id] || 0;
            return (
              <SpaceListItem
                key={space.id}
                space={space}
                icon={{ source: space.icon, mask: Image.Mask.RoundedRectangle }}
                accessories={[
                  {
                    icon: { source: customPersonIcon, tintColor: { light: "black", dark: "white" } },
                    text: memberCount.toString(),
                    tooltip: `Members: ${memberCount}`,
                  },
                ]}
                mutate={[mutateSpaces, mutatePinnedSpaces]}
                isPinned={false}
              />
            );
          })}
        </List.Section>
      ) : (
        <EmptyViewSpace title="No spaces found" />
      )}
    </List>
  );
}
