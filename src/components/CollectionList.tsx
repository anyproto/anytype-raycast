import { List, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { EmptyViewObject, ObjectListItem } from ".";
import { processObject } from "../helpers/object";
import { useObjectsInList } from "../hooks";
import { Space } from "../models";
import { pluralize } from "../utils";

type CollectionListProps = {
  space: Space;
  listId: string;
};

export function CollectionList({ space, listId }: CollectionListProps) {
  const [searchText, setSearchText] = useState("");
  const { objects, objectsError, isLoadingObjects, mutateObjects, objectsPagination } = useObjectsInList(
    space.id,
    listId,
  );

  useEffect(() => {
    if (objectsError) {
      showToast(Toast.Style.Failure, "Failed to fetch objects", objectsError.message);
    }
  }, [objectsError]);

  const filteredObjects = objects
    ?.filter((object) => object.name.toLowerCase().includes(searchText.toLowerCase()))
    .map((object) => {
      return processObject(object, false, mutateObjects);
    });

  return (
    <List
      isLoading={isLoadingObjects}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder={"Search objects in list..."}
      pagination={objectsPagination}
      throttle={true}
    >
      {filteredObjects && filteredObjects.length > 0 ? (
        <List.Section
          title={searchText ? "Search Results" : "Objects"}
          subtitle={pluralize(filteredObjects.length, "object", { withNumber: true })}
        >
          {filteredObjects.map((object) => (
            <ObjectListItem
              key={object.id}
              space={space}
              objectId={object.id}
              icon={object.icon}
              title={object.title}
              subtitle={object.subtitle}
              accessories={object.accessories}
              mutate={object.mutate}
              layout={object.layout}
              viewType="object"
              isGlobalSearch={false}
              isNoPinView={true}
              isPinned={object.isPinned}
            />
          ))}
        </List.Section>
      ) : (
        <EmptyViewObject
          title="No objects found"
          contextValues={{
            space: space.id,
            list: listId,
            name: searchText,
          }}
        />
      )}
    </List>
  );
}
