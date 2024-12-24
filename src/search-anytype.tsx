import {
  ActionPanel,
  Action,
  Icon,
  List,
  showToast,
  Toast,
  Image,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pluralize } from "./utils/helpers";
import { useSpaces } from "./hooks/useSpaces";
import * as A from "./hooks/api";
import * as S from "./utils/schemas";
import * as C from "./utils/constants";

export default function Search() {
  const [searchText, setSearchText] = useState("");
  const [items, setItems] = useState<S.SpaceObject[]>([]);
  const [filteredItems, setFilteredItems] = useState<S.SpaceObject[]>([]);
  const [spaceIcons, setSpaceIcons] = useState<{ [key: string]: string }>({});
  const [filterType, setFilterType] = useState("all");

  const {
    data: objects,
    isLoading: objectsLoading,
    error: objectsError,
  } = A.useGetObjects(searchText, "");
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
      isLoading={isLoadingSpaces || objectsLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search objects across all spaces …"
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by kind or space"
          storeValue={true}
          onChange={(newValue) => setFilterType(newValue)}
        >
          <List.Dropdown.Item title="All" value="all" icon={C.SEARCH_ICON} />
          <List.Dropdown.Section title="Kinds">
            <List.Dropdown.Item
              title="Pages"
              value="pages"
              icon={C.SPACE_OBJECT_ICON}
            />
            <List.Dropdown.Item
              title="Lists"
              value="lists"
              icon={C.LIST_ICON}
            />
            <List.Dropdown.Item
              title="Bookmarks"
              value="bookmarks"
              icon={C.BOOKMARK_ICON}
            />
            <List.Dropdown.Item
              title="Members"
              value="members"
              icon={C.SPACE_MEMBER_ICON}
            />
            <List.Dropdown.Item
              title="Other"
              value="other"
              icon={C.OTHERS_ICON}
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
        {filteredItems.map((item) => (
          <List.Item
            key={item.id}
            icon={{
              source: item.icon,
              mask:
                item.type === "participant" || item.type === "profile"
                  ? Image.Mask.Circle
                  : Image.Mask.RoundedRectangle,
            }}
            title={item.name}
            subtitle={item.object_type}
            accessories={[
              {
                date: new Date(item.details[0]?.details.lastModifiedDate),
                tooltip: `Last Modified: ${format(new Date(item.details[0]?.details.lastModifiedDate), "EEEE d MMMM yyyy 'at' HH:mm")}`,
              },
              {
                icon: {
                  source: spaceIcons[item.space_id] || Icon.QuestionMark,
                  mask: Image.Mask.RoundedRectangle,
                },
                tooltip: `Space: ${spaces?.find((space) => space.id === item.space_id)?.name}`,
              },
            ]}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser
                  icon={{ source: "../assets/anytype-icon.png" }}
                  title="Open in Anytype"
                  url={`anytype://object?objectId=${item.id}&spaceId=${item.space_id}`}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
