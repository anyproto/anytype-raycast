import { List, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { processObject } from "../helpers/object";
import { Template } from "../helpers/schemas";
import { pluralize } from "../helpers/strings";
import { useSearch } from "../hooks/useSearch";
import { useTemplates } from "../hooks/useTemplates";
import EmptyViewObject from "./EmptyViewObject";
import ObjectActions from "./ObjectActions";
import { CurrentView } from "./ObjectList";
import ObjectListItem from "./ObjectListItem";

type TemplatesListProps = {
  spaceId: string;
  typeId: string;
  isGlobalSearch: boolean;
  isPinned: boolean;
};

export default function TemplateList({ spaceId, typeId, isGlobalSearch, isPinned }: TemplatesListProps) {
  const [searchText, setSearchText] = useState("");
  const { templates, templatesError, isLoadingTemplates, mutateTemplates, templatesPagination } = useTemplates(
    spaceId,
    typeId,
  );
  const { objects, objectsError, isLoadingObjects, mutateObjects, objectsPagination } = useSearch(spaceId, searchText, [
    typeId,
  ]);

  useEffect(() => {
    if (templatesError) {
      showToast(Toast.Style.Failure, "Failed to fetch templates", templatesError.message);
    }
  }, [templatesError]);

  useEffect(() => {
    if (objectsError) {
      showToast(Toast.Style.Failure, "Failed to fetch objects", objectsError.message);
    }
  }, [objectsError]);

  const filteredTemplates = templates?.filter((template: Template) =>
    template.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const filteredObjects = objects
    ?.filter((object) => object.name.toLowerCase().includes(searchText.toLowerCase()))
    .map((object) => {
      return processObject(object, false, mutateObjects);
    });

  return (
    <List
      isLoading={isLoadingTemplates || isLoadingObjects}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search templates and objects..."
      pagination={objectsPagination || templatesPagination}
      throttle={true}
    >
      {filteredTemplates && filteredTemplates.length > 0 && (
        <List.Section
          title={searchText ? "Search Results" : "Templates"}
          subtitle={`${pluralize(filteredTemplates.length, "template", { withNumber: true })}`}
        >
          {filteredTemplates.map((template: Template) => (
            <List.Item
              key={template.id}
              title={template.name}
              icon={template.icon}
              actions={
                <ObjectActions
                  spaceId={spaceId}
                  objectId={template.id}
                  title={template.name}
                  mutateTemplates={mutateTemplates}
                  viewType="template"
                  isGlobalSearch={isGlobalSearch}
                  isNoPinView={true}
                  isPinned={isPinned}
                />
              }
            />
          ))}
        </List.Section>
      )}

      {filteredObjects && filteredObjects.length > 0 && (
        <List.Section
          title={searchText ? "Search Results" : "Objects"}
          subtitle={`${pluralize(filteredObjects.length, "object", { withNumber: true })}`}
        >
          {filteredObjects.map((object) => (
            <ObjectListItem
              key={object.key}
              spaceId={object.spaceId}
              objectId={object.id}
              icon={object.icon}
              title={object.title}
              subtitle={object.subtitle}
              accessories={object.accessories}
              mutate={object.mutate}
              layout={object.layout}
              viewType={CurrentView.objects}
              isGlobalSearch={isGlobalSearch}
              isNoPinView={true}
              isPinned={object.isPinned}
            />
          ))}
        </List.Section>
      )}

      {(!filteredTemplates || filteredTemplates.length === 0) && (!filteredObjects || filteredObjects.length === 0) && (
        <EmptyViewObject
          title="No templates or objects found"
          contextValues={{
            space: spaceId,
            type: typeId,
            name: searchText,
          }}
        />
      )}
    </List>
  );
}
