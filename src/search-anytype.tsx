import { Icon, List, showToast, Toast, Image } from "@raycast/api";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pluralize } from "./utils/helpers";
import { useSpaces } from "./hooks/useSpaces";
import { useSearch } from "./hooks/useSearch";
import { SpaceObject } from "./utils/schemas";
import ObjectListItem from "./components/ObjectListItem";
import EmptyView from "./components/EmptyView";
import { SEARCH_ICON, OBJECT_ICON, LIST_ICON, BOOKMARK_ICON, MEMBER_ICON } from "./utils/constants";

export default function Search() {
  const [searchText, setSearchText] = useState("");
  const [objectTypes, setObjectTypes] = useState<string[]>([]);
  const [filteredItems, setFilteredItems] = useState<SpaceObject[]>([]);
  const [spaceIcons, setSpaceIcons] = useState<{ [key: string]: string }>({});
  const [filterType, setFilterType] = useState("all");

  const { objects, objectsError, isLoadingObjects, objectsPagination } = useSearch(searchText, objectTypes);
  const { spaces, spacesError, isLoadingSpaces } = useSpaces();

  useEffect(() => {
    if (spaces) {
      const spaceIconMap = spaces.reduce(
        (acc, space) => {
          acc[space.id] = space.icon;
          return acc;
        },
        {} as { [key: string]: string },
      );
      setSpaceIcons(spaceIconMap);
    }
  }, [spaces]);

  useEffect(() => {
    if (objects) {
      const filteredObjects = objects.filter(
        (object) =>
          object.name.toLowerCase().includes(searchText.toLowerCase()) ||
          object.object_type.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFilteredItems(filteredObjects);
    }
  }, [objects, searchText]);

  useEffect(() => {
    const objectTypeMap: { [key: string]: string[] } = {
      all: [],
      pages: ["ot-note", "ot-page"],
      lists: ["ot-set", "ot-collection"],
      bookmarks: ["ot-bookmark"],
      members: ["ot-profile"],
    };

    setObjectTypes(objectTypeMap[filterType] || []);
  }, [filterType]);

  useEffect(() => {
    if (objectsError || spacesError) {
      showToast(Toast.Style.Failure, "Failed to fetch latest data", (objectsError || spacesError)?.message);
    }
  }, [objectsError, spacesError]);

  return (
    <List
      isLoading={isLoadingSpaces || isLoadingObjects}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Globally search objects across spaces..."
      pagination={objectsPagination}
      throttle={true}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by kind or space"
          storeValue={true}
          onChange={(newValue) => setFilterType(newValue)}
        >
          <List.Dropdown.Item title="All" value="all" icon={SEARCH_ICON} />
          <List.Dropdown.Item title="Pages" value="pages" icon={OBJECT_ICON} />
          <List.Dropdown.Item title="Lists" value="lists" icon={LIST_ICON} />
          <List.Dropdown.Item title="Bookmarks" value="bookmarks" icon={BOOKMARK_ICON} />
          <List.Dropdown.Item title="Members" value="members" icon={MEMBER_ICON} />
        </List.Dropdown>
      }
    >
      {filteredItems.length > 0 ? (
        <List.Section
          title={searchText ? "Search Results" : "Modified Recently"}
          subtitle={pluralize(filteredItems.length, "object", {
            withNumber: true,
          })}
        >
          {filteredItems.map((object) => (
            <ObjectListItem
              key={object.id}
              spaceId={object.space_id}
              objectId={object.id}
              icon={{
                source: object.icon,
                mask:
                  (object.layout === "participant" || object.layout === "profile") && object.icon != OBJECT_ICON
                    ? Image.Mask.Circle
                    : Image.Mask.RoundedRectangle,
              }}
              title={object.name}
              subtitle={{
                value: object.object_type,
                tooltip: `Object Type: ${object.object_type}`,
              }}
              accessories={[
                {
                  date: new Date(object.details[0]?.details.lastModifiedDate as string),
                  tooltip: `Last Modified: ${format(new Date(object.details[0]?.details.lastModifiedDate as string), "EEEE d MMMM yyyy 'at' HH:mm")}`,
                },
                {
                  icon: {
                    source: spaceIcons[object.space_id] || Icon.QuestionMark,
                    mask: Image.Mask.RoundedRectangle,
                  },
                  tooltip: `Space: ${spaces?.find((space) => space.id === object.space_id)?.name}`,
                },
              ]}
              details={object.details}
            />
          ))}
        </List.Section>
      ) : (
        <EmptyView title="No Objects Found" />
      )}
    </List>
  );
}
