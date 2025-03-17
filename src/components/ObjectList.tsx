import { Icon, List, showToast, Toast } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { useEffect, useState } from "react";
import { EmptyViewObject, ObjectListItem } from ".";
import { processObject } from "../helpers/object";
import { useMembers, usePinnedMembers, usePinnedObjects, usePinnedTypes, useSearch, useTypes } from "../hooks";
import { Member, MemberStatus, Space, SpaceObject, Type } from "../models";
import { defaultTintColor, formatMemberRole, localStorageKeys, pluralize } from "../utils";

type ObjectListProps = {
  space: Space;
};

export const CurrentView = {
  objects: "objects",
  types: "types",
  members: "members",
} as const;

export function ObjectList({ space }: ObjectListProps) {
  const [currentView, setCurrentView] = useState<keyof typeof CurrentView>(CurrentView.objects);
  const [searchText, setSearchText] = useState("");

  const { objects, objectsError, isLoadingObjects, mutateObjects, objectsPagination } = useSearch(
    space.id,
    searchText,
    [],
  );
  const { types, typesError, isLoadingTypes, mutateTypes, typesPagination } = useTypes(space.id);
  const { members, membersError, isLoadingMembers, mutateMembers, membersPagination } = useMembers(space.id);
  const { pinnedObjects, pinnedObjectsError, isLoadingPinnedObjects, mutatePinnedObjects } = usePinnedObjects(
    localStorageKeys.suffixForViewsPerSpace(space.id, CurrentView.objects),
  );
  const { pinnedTypes, pinnedTypesError, isLoadingPinnedTypes, mutatePinnedTypes } = usePinnedTypes(
    localStorageKeys.suffixForViewsPerSpace(space.id, CurrentView.types),
  );
  const { pinnedMembers, pinnedMembersError, isLoadingPinnedMembers, mutatePinnedMembers } = usePinnedMembers(
    localStorageKeys.suffixForViewsPerSpace(space.id, CurrentView.members),
  );
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
    if (objectsError || typesError || membersError) {
      showToast(
        Toast.Style.Failure,
        "Failed to fetch latest data",
        objectsError?.message || typesError?.message || membersError?.message,
      );
    }
  }, [objectsError, typesError, membersError]);

  useEffect(() => {
    if (pinnedObjectsError || pinnedTypesError || pinnedMembersError) {
      showToast(
        Toast.Style.Failure,
        "Failed to fetch pinned data",
        pinnedObjectsError?.message || pinnedTypesError?.message || pinnedMembersError?.message,
      );
    }
  }, [pinnedObjectsError, pinnedTypesError, pinnedMembersError]);

  const filterItems = <T extends { name: string }>(items: T[], searchText: string): T[] => {
    return items?.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()));
  };

  const processType = (type: Type, isPinned: boolean) => {
    return {
      spaceId: space.id,
      id: type.id,
      icon: type.icon,
      title: type.name,
      dataview: undefined,
      subtitle: { value: "", tooltip: "" },
      accessories: [isPinned ? { icon: Icon.Star, tooltip: "Pinned" } : {}],
      mutate: [mutateTypes, mutatePinnedTypes as MutatePromise<SpaceObject[] | Type[] | Member[]>],
      member: undefined,
      layout: "",
      isPinned,
    };
  };

  const processMember = (member: Member, isPinned: boolean) => {
    return {
      spaceId: space.id,
      id: member.id,
      icon: member.icon,
      title: member.name,
      dataview: undefined,
      subtitle: { value: member.global_name, tooltip: `Global Name: ${member.global_name}` },
      accessories: [
        ...(isPinned ? [{ icon: Icon.Star, tooltip: "Pinned" }] : []),
        member.status === MemberStatus.Joining
          ? {
              tag: { value: "Join Request", color: "orange", tooltip: "Pending" },
            }
          : {
              text: formatMemberRole(member.role),
              tooltip: `Role: ${formatMemberRole(member.role)}`,
            },
      ],
      mutate: [mutateMembers, mutatePinnedMembers as MutatePromise<SpaceObject[] | Type[] | Member[]>],
      member: member,
      layout: "",
      isPinned,
    };
  };

  const getCurrentItems = () => {
    switch (currentView) {
      case "objects": {
        const processedPinned = pinnedObjects?.length
          ? pinnedObjects
              .filter((object) => filterItems([object], searchText).length > 0)
              .map((object) => processObject(object, true, mutateObjects, mutatePinnedObjects))
          : [];

        const processedRegular = objects
          .filter(
            (object) =>
              !pinnedObjects?.some((pinned) => pinned.id === object.id && pinned.space_id === object.space_id),
          )
          .map((object) => processObject(object, false, mutateObjects, mutatePinnedObjects));

        return { processedPinned, processedRegular };
      }

      case "types": {
        const processedPinned = pinnedTypes?.length
          ? pinnedTypes
              .filter((type) => filterItems([type], searchText).length > 0)
              .map((type) => processType(type, true))
          : [];

        const processedRegular = types
          .filter((type) => !pinnedTypes?.some((pinned) => pinned.id === type.id))
          .filter((type) => filterItems([type], searchText).length > 0)
          .map((type) => processType(type, false));

        return { processedPinned, processedRegular };
      }

      case "members": {
        const processedPinned = pinnedMembers?.length
          ? pinnedMembers
              .filter((member) => filterItems([member], searchText).length > 0)
              .map((member) => processMember(member, true))
          : [];

        const processedRegular = members
          .filter((member) => !pinnedMembers?.some((pinned) => pinned.id === member.id))
          .filter((member) => filterItems([member], searchText).length > 0)
          .map((member) => processMember(member, false));

        return { processedPinned, processedRegular };
      }

      default:
        return {
          processedPinned: [],
          processedRegular: [],
        };
    }
  };

  const { processedPinned, processedRegular } = getCurrentItems();
  const isLoading =
    isLoadingObjects ||
    isLoadingTypes ||
    isLoadingMembers ||
    isLoadingPinnedObjects ||
    isLoadingPinnedTypes ||
    isLoadingPinnedMembers;

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder={`Search ${currentView}...`}
      navigationTitle={`Browse ${space.name}`}
      pagination={pagination}
      throttle={true}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Choose View"
          onChange={(value) => setCurrentView(value as "objects" | "types" | "members")}
        >
          <List.Dropdown.Item
            title="Objects"
            value="objects"
            icon={{ source: "icons/type/document.svg", tintColor: defaultTintColor }}
          />
          <List.Dropdown.Item
            title="Types"
            value="types"
            icon={{ source: "icons/type/extension-puzzle.svg", tintColor: defaultTintColor }}
          />
          <List.Dropdown.Item
            title="Members"
            value="members"
            icon={{ source: "icons/type/person.svg", tintColor: defaultTintColor }}
          />
        </List.Dropdown>
      }
    >
      {processedPinned && processedPinned.length > 0 && (
        <List.Section
          title="Pinned"
          subtitle={`${pluralize(processedPinned.length, currentView.slice(0, -1), { withNumber: true })}`}
        >
          {processedPinned.map((item) => (
            <ObjectListItem
              key={item.id}
              space={space}
              objectId={item.id}
              icon={item.icon}
              title={item.title}
              dataview={item.dataview}
              subtitle={item.subtitle}
              accessories={item.accessories}
              mutate={item.mutate}
              member={item.member}
              layout={item.layout}
              viewType={currentView}
              isGlobalSearch={false}
              isNoPinView={false}
              isPinned={item.isPinned}
            />
          ))}
        </List.Section>
      )}
      {processedRegular && processedRegular.length > 0 ? (
        <List.Section
          title={searchText ? "Search Results" : `All ${currentView.charAt(0).toUpperCase() + currentView.slice(1)}`}
          subtitle={`${pluralize(processedRegular.length, currentView.slice(0, -1), { withNumber: true })}`}
        >
          {processedRegular.map((item) => (
            <ObjectListItem
              key={item.id}
              space={space}
              objectId={item.id}
              icon={item.icon}
              title={item.title}
              dataview={item.dataview}
              subtitle={item.subtitle}
              accessories={item.accessories}
              mutate={item.mutate}
              member={item.member}
              layout={item.layout}
              viewType={currentView}
              isGlobalSearch={false}
              isNoPinView={false}
              isPinned={item.isPinned}
            />
          ))}
        </List.Section>
      ) : (
        <EmptyViewObject
          title={`No ${currentView.charAt(0).toUpperCase() + currentView.slice(1)} Found`}
          contextValues={{
            space: space.id,
            name: searchText,
          }}
        />
      )}
    </List>
  );
}
