import { Icon, List, Image } from "@raycast/api";
import { useState } from "react";
import { format } from "date-fns";
import ObjectListItem from "./ObjectListItem";
import { useMembers } from "../hooks/useMembers";
import { useObjectsForSpace } from "../hooks/useObjectsForSpace";
import { useTypes } from "../hooks/useTypes";
import {
  TYPE_ICON,
  SPACE_OBJECT_ICON,
  SPACE_MEMBER_ICON,
} from "../utils/constants";

type ObjectListProps = {
  spaceId: string;
};

export default function ObjectList({ spaceId }: ObjectListProps) {
  const [currentView, setCurrentView] = useState<
    "objects" | "types" | "members"
  >("objects");

  const { objects, isLoadingObjects } = useObjectsForSpace(spaceId);
  const { types, isLoadingTypes } = useTypes(spaceId);
  const { members, isLoadingMembers } = useMembers(spaceId);

  return (
    <List
      isLoading={isLoadingMembers || isLoadingObjects || isLoadingTypes}
      searchBarPlaceholder={`Search ${currentView}...`}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Choose View"
          // storeValue={true}
          onChange={(value) =>
            setCurrentView(value as "objects" | "types" | "members")
          }
        >
          <List.Dropdown.Item
            title="Objects"
            value="objects"
            icon={SPACE_OBJECT_ICON}
          />
          <List.Dropdown.Item title="Types" value="types" icon={TYPE_ICON} />
          <List.Dropdown.Item
            title="Members"
            value="members"
            icon={SPACE_MEMBER_ICON}
          />
        </List.Dropdown>
      }
    >
      {currentView === "objects" &&
        objects?.map((object) => (
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
              tooltip: `Object Type: ${object.object_type}`,
            }}
            accessories={[
              {
                date: new Date(object.details[0]?.details.lastModifiedDate),
                tooltip: `Last Modified: ${format(new Date(object.details[0]?.details.lastModifiedDate), "EEEE d MMMM yyyy 'at' HH:mm")}`,
              },
            ]}
            details={object.details}
            blocks={object.blocks}
          />
        ))}
      {currentView === "types" &&
        types?.map((type) => (
          <ObjectListItem
            key={type.id}
            spaceId={spaceId}
            objectId={type.id}
            icon={type.icon}
            title={type.name}
          />
        ))}
      {currentView === "members" &&
        members?.map((member) => (
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
        ))}
    </List>
  );
}
