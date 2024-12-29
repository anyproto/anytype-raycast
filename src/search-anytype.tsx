import { Icon, List, showToast, Toast, Image } from "@raycast/api";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pluralize } from "./utils/helpers";
import { useSpaces } from "./hooks/useSpaces";
import { useSearch } from "./hooks/useSearch";
import { SpaceObject } from "./utils/schemas";
import {
  SEARCH_ICON,
  SPACE_OBJECT_ICON,
  LIST_ICON,
  BOOKMARK_ICON,
  SPACE_MEMBER_ICON,
  OTHERS_ICON,
} from "./utils/constants";
import ObjectListItem from "./components/ObjectListItem";

export default function Search() {
  const [searchText, setSearchText] = useState("");
  // TODO: implement object type filtering
  const [objectType] = useState("");
  const [items, setItems] = useState<SpaceObject[]>([]);
  const [filteredItems, setFilteredItems] = useState<SpaceObject[]>([]);
  const [spaceIcons, setSpaceIcons] = useState<{ [key: string]: string }>({});
  const [filterType, setFilterType] = useState("all");

  const { objects, objectsError, isLoadingObjects, pagination } = useSearch(
    searchText,
    objectType,
  );
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
      // TODO investigate object_type matching on api side; currently only name is matched
      const filteredObjects = objects.filter(
        (object) =>
          object.name.toLowerCase().includes(searchText.toLowerCase()) ||
          object.object_type.toLowerCase().includes(searchText.toLowerCase()),
      );
      setItems(filteredObjects);
    }
  }, [objects, searchText]);

  useEffect(() => {
    const applyFilter = () => {
      const filtered = items.filter((item) => {
        if (filterType === "all") {
          return true;
        }

        const matchesType = (() => {
          switch (filterType) {
            case "pages":
              return (
                item.type === "basic" ||
                item.type === "profile" ||
                item.type === "todo"
              );
            case "lists":
              return item.type === "set" || item.type === "collection";
            case "bookmarks":
              return item.type === "bookmark";
            case "members":
              return item.type === "participant";
            case "other":
              return ![
                "basic",
                "profile",
                "todo",
                "set",
                "collection",
                "bookmark",
                "participant",
              ].includes(item.type);
            default:
              return false;
          }
        })();

        const matchesSpace = item.space_id === filterType;

        return matchesType || matchesSpace;
      });
      setFilteredItems(filtered);
    };

    applyFilter();
  }, [items, filterType]);

  if (objectsError || spacesError) {
    console.error("Error fetching data:", objectsError || spacesError);
    showToast(
      Toast.Style.Failure,
      "Failed to fetch data",
      (objectsError || spacesError)?.message,
    );
  }

  return (
    <List
      isLoading={isLoadingSpaces || isLoadingObjects}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search objects across all spaces …"
      pagination={pagination}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by kind or space"
          storeValue={true}
          onChange={(newValue) => setFilterType(newValue)}
        >
          <List.Dropdown.Item title="All" value="all" icon={SEARCH_ICON} />
          <List.Dropdown.Section title="Kinds">
            <List.Dropdown.Item
              title="Pages"
              value="pages"
              icon={SPACE_OBJECT_ICON}
            />
            <List.Dropdown.Item title="Lists" value="lists" icon={LIST_ICON} />
            <List.Dropdown.Item
              title="Bookmarks"
              value="bookmarks"
              icon={BOOKMARK_ICON}
            />
            <List.Dropdown.Item
              title="Members"
              value="members"
              icon={SPACE_MEMBER_ICON}
            />
            <List.Dropdown.Item
              title="Other"
              value="other"
              icon={OTHERS_ICON}
            />
          </List.Dropdown.Section>
          <List.Dropdown.Section title="Spaces">
            {spaces?.map((space) => (
              <List.Dropdown.Item
                key={space.id}
                title={space.name}
                value={space.id}
                icon={{ source: space.icon, mask: Image.Mask.RoundedRectangle }}
              />
            ))}
          </List.Dropdown.Section>
        </List.Dropdown>
      }
    >
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
                object.type === "participant" || object.type === "profile"
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
                date: new Date(
                  object.details[0]?.details.lastModifiedDate as string,
                ),
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
            blocks={object.blocks}
          />
        ))}
      </List.Section>
    </List>
  );
}
