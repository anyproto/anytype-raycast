import { Icon, List, Image, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import ObjectListItem from "./ObjectListItem";
import { useMembers } from "../hooks/useMembers";
import { useObjects } from "../hooks/useObjects";
import { useTypes } from "../hooks/useTypes";
import { TYPE_ICON, SPACE_OBJECT_ICON, SPACE_MEMBER_ICON } from "../utils/constants";

type ObjectListProps = {
  spaceId: string;
};

export default function ObjectList({ spaceId }: ObjectListProps) {
  const [currentView, setCurrentView] = useState<"objects" | "types" | "members">("objects");
  const [searchText, setSearchText] = useState("");

  const { objects, objectsError, isLoadingObjects, objectsPagination } = useObjects(spaceId);
  const { types, typesError, isLoadingTypes, typesPagination } = useTypes(spaceId);
  const { members, membersError, isLoadingMembers, membersPagination } = useMembers(spaceId);
  const [pagination, setPagination] = useState(objectsPagination);

  useEffect(() => {
    const newPagination = {
      objects: objectsPagination,
      types: typesPagination,
      members: membersPagination,
    }[currentView];
    setPagination(newPagination);
  }, [currentView, objects, types, members]);

  if (objectsError) {
    showToast(Toast.Style.Failure, "Failed to fetch objects", objectsError.message);
  }

  if (typesError) {
    showToast(Toast.Style.Failure, "Failed to fetch types", typesError.message);
  }

  if (membersError) {
    showToast(Toast.Style.Failure, "Failed to fetch members", membersError.message);
  }

  const filterItems = <T extends { name: string }>(items: T[], searchText: string): T[] => {
    return items?.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()));
  };

  const getCurrentItems = () => {
    switch (currentView) {
      case "objects":
        return filterItems(objects, searchText)?.map((object) => (
          <ObjectListItem
            key={object.id}
            spaceId={spaceId}
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
              tooltip: `Object Type: ${object.type}`,
            }}
            accessories={[
              {
                date: new Date(object.details[0]?.details.lastModifiedDate as string),
                tooltip: `Last Modified: ${format(new Date(object.details[0]?.details.lastModifiedDate as string), "EEEE d MMMM yyyy 'at' HH:mm")}`,
              },
            ]}
            details={object.details}
          />
        ));
      case "types":
        return filterItems(types, searchText)?.map((type) => (
          <ObjectListItem key={type.id} spaceId={spaceId} objectId={type.id} icon={type.icon} title={type.name} />
        ));
      case "members":
        return filterItems(members, searchText)?.map((member) => (
          <ObjectListItem
            key={member.identity}
            spaceId={spaceId}
            objectId={member.id}
            icon={{ source: member.icon, mask: Image.Mask.Circle }}
            title={member.name}
            subtitle={{
              value: member.global_name,
              tooltip: `Global Name: ${member.global_name}`,
            }}
            accessories={[
              {
                icon:
                  member.role === "Owner"
                    ? Icon.Star
                    : member.role === "Writer"
                      ? Icon.Pencil
                      : member.role === "Reader"
                        ? Icon.Eye
                        : Icon.XMarkCircle,
                text: member.role,
                tooltip: `Role: ${member.role}`,
              },
            ]}
          />
        ));
      default:
        return null;
    }
  };

  return (
    <List
      isLoading={isLoadingMembers || isLoadingObjects || isLoadingTypes}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder={`Search ${currentView}...`}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Choose View"
          onChange={(value) => setCurrentView(value as "objects" | "types" | "members")}
        >
          <List.Dropdown.Item title="Objects" value="objects" icon={SPACE_OBJECT_ICON} />
          <List.Dropdown.Item title="Types" value="types" icon={TYPE_ICON} />
          <List.Dropdown.Item title="Members" value="members" icon={SPACE_MEMBER_ICON} />
        </List.Dropdown>
      }
      pagination={pagination}
    >
      <List.Section
        title={searchText ? "Search Results" : `${currentView.charAt(0).toUpperCase() + currentView.slice(1)}`}
        subtitle={
          searchText ? `${getCurrentItems()?.length || 0} ${currentView}` : `Total: ${getCurrentItems()?.length || 0}`
        }
      >
        {getCurrentItems()}
      </List.Section>
    </List>
  );
}
