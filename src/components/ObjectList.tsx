import { Icon, List, Image, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import ObjectListItem from "./ObjectListItem";
import { useMembers } from "../hooks/useMembers";
import { useObjects } from "../hooks/useObjects";
import { useTypes } from "../hooks/useTypes";
import EmptyView from "./EmptyView";

type ObjectListProps = {
  spaceId: string;
};

export default function ObjectList({ spaceId }: ObjectListProps) {
  const [currentView, setCurrentView] = useState<"objects" | "types" | "members">("objects");
  const [searchText, setSearchText] = useState("");

  const { objects, objectsError, isLoadingObjects, mutateObjects, objectsPagination } = useObjects(spaceId);
  const { types, typesError, isLoadingTypes, mutateTypes, typesPagination } = useTypes(spaceId);
  const { members, membersError, isLoadingMembers, mutateMembers, membersPagination } = useMembers(spaceId);
  const [pagination, setPagination] = useState(objectsPagination);

  useEffect(() => {
    const newPagination = {
      objects: objectsPagination,
      types: typesPagination,
      members: membersPagination,
    }[currentView];
    setPagination(newPagination);
  }, [currentView, objects, types, members]);

  useEffect(() => {
    if (objectsError) {
      showToast(Toast.Style.Failure, "Failed to fetch objects", objectsError.message);
    }
  }, [objectsError]);

  useEffect(() => {
    if (typesError) {
      showToast(Toast.Style.Failure, "Failed to fetch types", typesError.message);
    }
  }, [typesError]);

  useEffect(() => {
    if (membersError) {
      showToast(Toast.Style.Failure, "Failed to fetch members", membersError.message);
    }
  }, [membersError]);

  const filterItems = <T extends { name: string }>(items: T[], searchText: string): T[] => {
    return items?.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()));
  };

  const formatRole = (role: string) => {
    return role.replace("Reader", "Viewer").replace("Writer", "Editor");
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
                (object.layout === "participant" || object.layout === "profile") && object.icon != Icon.Document
                  ? Image.Mask.Circle
                  : Image.Mask.RoundedRectangle,
            }}
            title={object.name}
            subtitle={{
              value: object.object_type,
              tooltip: `Object Type: ${object.layout}`,
            }}
            accessories={[
              {
                date: new Date(object.details[0]?.details.last_modified_date as string),
                tooltip: `Last Modified: ${format(new Date(object.details[0]?.details.last_modified_date as string), "EEEE d MMMM yyyy 'at' HH:mm")}`,
              },
            ]}
            details={object.details}
            mutate={mutateObjects}
            viewType="object"
          />
        ));
      case "types":
        return filterItems(types, searchText)?.map((type) => (
          <ObjectListItem
            key={type.id}
            spaceId={spaceId}
            objectId={type.id}
            icon={type.icon}
            title={type.name}
            mutate={mutateTypes}
            viewType="type"
          />
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
                text: formatRole(member.role),
                tooltip: `Role: ${formatRole(member.role)}`,
              },
            ]}
            mutate={mutateMembers}
            viewType="member"
          />
        ));
      default:
        return null;
    }
  };

  const currentItems = getCurrentItems();

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
          <List.Dropdown.Item title="Objects" value="objects" icon={Icon.Document} />
          <List.Dropdown.Item title="Types" value="types" icon={Icon.Lowercase} />
          <List.Dropdown.Item title="Members" value="members" icon={Icon.PersonCircle} />
        </List.Dropdown>
      }
      pagination={pagination}
    >
      {currentItems && currentItems?.length > 0 ? (
        <List.Section
          title={searchText ? "Search Results" : `${currentView.charAt(0).toUpperCase() + currentView.slice(1)}`}
          subtitle={
            searchText ? `${getCurrentItems()?.length || 0} ${currentView}` : `Total: ${getCurrentItems()?.length || 0}`
          }
        >
          {getCurrentItems()}
        </List.Section>
      ) : (
        <EmptyView title={`No ${currentView.charAt(0).toUpperCase() + currentView.slice(1)} Found`} />
      )}
    </List>
  );
}
