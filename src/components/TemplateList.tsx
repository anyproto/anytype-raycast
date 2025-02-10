import { List, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { getMaskForObject } from "../helpers/icon";
import { Template } from "../helpers/schemas";
import { pluralize } from "../helpers/strings";
import { useSearch } from "../hooks/useSearch";
import { useTemplates } from "../hooks/useTemplates";
import EmptyView from "./EmptyView";
import ObjectActions from "./ObjectActions";
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

  if (templatesError) {
    showToast(Toast.Style.Failure, "Failed to fetch templates", templatesError.message);
  }

  if (objectsError) {
    showToast(Toast.Style.Failure, "Failed to fetch objects", objectsError.message);
  }

  const filteredTemplates = templates?.filter((template: Template) =>
    template.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const filteredObjects = objects?.filter((object) => object.name.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <List
      isLoading={isLoadingTemplates || isLoadingObjects}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search Templates..."
      pagination={objectsPagination || templatesPagination}
    >
      {filteredTemplates && filteredTemplates.length > 0 ? (
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
                  isPinned={isPinned}
                />
              }
            />
          ))}
        </List.Section>
      ) : (
        <EmptyView title="No templates found" />
      )}
      {filteredObjects && filteredObjects.length > 0 ? (
        <List.Section
          title={searchText ? "Search Results" : "Objects"}
          subtitle={`${pluralize(filteredObjects.length, "object", { withNumber: true })}`}
        >
          {filteredObjects.map((object) => (
            <ObjectListItem
              key={object.id}
              spaceId={object.space_id}
              objectId={object.id}
              icon={{ source: object.icon, mask: getMaskForObject(object.layout, object.icon) }}
              title={object.name}
              subtitle={{ value: object.type, tooltip: `Type: ${object.type}` }}
              accessories={[]}
              mutate={[mutateObjects]}
              viewType="object"
              isGlobalSearch={isGlobalSearch}
              isPinned={isPinned}
            />
          ))}
        </List.Section>
      ) : (
        <EmptyView title="No objects found" />
      )}
    </List>
  );
}
