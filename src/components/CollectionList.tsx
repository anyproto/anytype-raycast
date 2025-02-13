import { List, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { processObject } from "../helpers/object";
import { pluralize } from "../helpers/strings";
import { useObjectsInList } from "../hooks/useObjectsInList";
import EmptyViewObject from "./EmptyViewObject";
import ObjectListItem from "./ObjectListItem";

type CollectionListProps = {
  spaceId: string;
  listId: string;
};

export default function CollectionList({ spaceId, listId }: CollectionListProps) {
  const [searchText, setSearchText] = useState("");
  const { objects, objectsError, isLoadingObjects, mutateObjects, objectsPagination } = useObjectsInList(
    spaceId,
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
    >
      {filteredObjects && filteredObjects.length > 0 ? (
        <List.Section
          title={searchText ? "Search Results" : "Objects"}
          subtitle={pluralize(filteredObjects.length, "object", { withNumber: true })}
        >
          {filteredObjects.map((object) => (
            <ObjectListItem
              key={object.id}
              spaceId={spaceId}
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
            space: spaceId,
            list: listId,
            name: searchText,
          }}
        />
      )}
    </List>
  );
}
