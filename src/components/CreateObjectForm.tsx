import { Action, ActionPanel, Form, Icon, popToRoot, showToast, Toast } from "@raycast/api";
import { useForm } from "@raycast/utils";
import { formatRFC3339 } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { addObjectsToList, createObject } from "../api";
import { CreateObjectFormValues } from "../create-object";
import { useTagsMap } from "../hooks";
import { CreateObjectRequest, IconFormat, Space, SpaceObject, Template, Type } from "../models";
import { apiPropertyKeys, fetchTypeKeysForLists, isEmoji } from "../utils";

interface CreateObjectFormProps {
  spaces: Space[];
  types: Type[];
  templates: Template[];
  lists: SpaceObject[];
  selectedSpace: string;
  setSelectedSpace: (spaceId: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedTemplate: string;
  setSelectedTemplate: (templateId: string) => void;
  selectedList: string;
  setSelectedList: (listId: string) => void;
  listSearchText: string;
  setListSearchText: (searchText: string) => void;
  isLoading: boolean;
  draftValues: CreateObjectFormValues;
  enableDrafts: boolean;
}

type FieldValue = string | boolean | string[] | Date | null | undefined;

export function CreateObjectForm({
  spaces,
  types,
  templates,
  lists,
  selectedSpace,
  setSelectedSpace,
  selectedType,
  setSelectedType,
  selectedTemplate,
  setSelectedTemplate,
  selectedList,
  setSelectedList,
  listSearchText,
  setListSearchText,
  isLoading,
  draftValues,
  enableDrafts,
}: CreateObjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [typeKeysForLists, setTypeKeysForLists] = useState<string[]>([]);
  const hasSelectedSpaceAndType = selectedSpace && selectedType;
  const selectedTypeUniqueKey = useMemo(
    () => types.reduce((acc, type) => (type.id === selectedType ? type.key : acc), ""),
    [types, selectedType],
  );

  // Fetch tags for all properties in one hook call
  const selectedTypeDef = types.find((type) => type.id === selectedType);
  const properties = selectedTypeDef?.properties.filter((prop) => prop.key !== apiPropertyKeys.description) || []; // handle description separately
  const { tagsMap = {} } = useTagsMap(
    selectedSpace,
    properties.filter((prop) => prop.format === "select" || prop.format === "multi_select").map((prop) => prop.key),
  );

  useEffect(() => {
    const fetchTypesForLists = async () => {
      if (spaces) {
        const listsTypes = await fetchTypeKeysForLists(spaces);
        setTypeKeysForLists(listsTypes);
      }
    };
    fetchTypesForLists();
  }, [spaces]);

  const { handleSubmit, itemProps } = useForm<CreateObjectFormValues>({
    initialValues: draftValues,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await showToast({ style: Toast.Style.Animated, title: "Creating object..." });
        const propertiesObj: Record<string, string | number | boolean | string[]> = {};
        properties.forEach((prop) => {
          const propValue = itemProps[prop.key as keyof typeof itemProps]?.value;
          if (propValue !== undefined && propValue !== null && propValue !== "") {
            switch (prop.format) {
              case "number":
                propertiesObj[prop.key] = Number(propValue);
                break;
              case "multi_select":
                propertiesObj[prop.key] = propValue as string[];
                break;
              case "date":
                propertiesObj[prop.key] = formatRFC3339(propValue as Date);
                break;
              case "checkbox":
                propertiesObj[prop.key] = Boolean(propValue);
                break;
              default:
                propertiesObj[prop.key] = propValue as string;
            }
          }
        });

        const objectData: CreateObjectRequest = {
          name: values.name || "",
          icon: { format: IconFormat.Emoji, emoji: values.icon || "" },
          description: values.description || "",
          body: values.body || "",
          source: values.source || "",
          template_id: values.template || "",
          type_key: selectedTypeUniqueKey,
          properties: propertiesObj,
        };

        const response = await createObject(selectedSpace, objectData);

        if (response.object?.id) {
          if (selectedList) {
            await addObjectsToList(selectedSpace, selectedList, [response.object.id]);
            await showToast(Toast.Style.Success, "Object created and added to collection");
          } else {
            await showToast(Toast.Style.Success, "Object created successfully");
          }
          popToRoot();
        } else {
          await showToast(Toast.Style.Failure, "Failed to create object");
        }
      } catch (error) {
        await showToast(Toast.Style.Failure, "Failed to create object", String(error));
      } finally {
        setLoading(false);
      }
    },
    validation: {
      name: (value: FieldValue) => {
        const str = typeof value === "string" ? value : undefined;
        if (!["ot-bookmark", "ot-note"].includes(selectedTypeUniqueKey) && (!str || str.trim() === "")) {
          return "Name is required";
        }
      },
      icon: (value: FieldValue) => {
        if (typeof value === "string" && !isEmoji(value)) {
          return "Icon must be single emoji";
        }
      },
      source: (value: FieldValue) => {
        const str = typeof value === "string" ? value : undefined;
        if (selectedTypeUniqueKey === "ot-bookmark" && (!str || str.trim() === "")) {
          return "Source is required for Bookmarks";
        }
      },
    },
  });

  function getQuicklink(): { name: string; link: string } {
    const url = "raycast://extensions/any/anytype/create-object";

    const launchContext = {
      defaults: {
        space: selectedSpace,
        type: selectedType,
        list: selectedList,
        name: itemProps.name.value,
        icon: itemProps.icon.value,
        description: itemProps.description.value,
        body: itemProps.body.value,
        source: itemProps.source.value,
      },
    };

    return {
      name: `Create ${types.find((type) => type.key === selectedTypeUniqueKey)?.name} in ${spaces.find((space) => space.id === selectedSpace)?.name}`,
      link: url + "?launchContext=" + encodeURIComponent(JSON.stringify(launchContext)),
    };
  }

  return (
    <Form
      navigationTitle="Create Object"
      isLoading={loading || isLoading}
      enableDrafts={enableDrafts}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Object" icon={Icon.Plus} onSubmit={handleSubmit} />
          {hasSelectedSpaceAndType && (
            <Action.CreateQuicklink
              title={`Create Quicklink: ${types.find((type) => type.key === selectedTypeUniqueKey)?.name}`}
              quicklink={getQuicklink()}
            />
          )}
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="space"
        title="Space"
        value={selectedSpace}
        onChange={setSelectedSpace}
        storeValue={true}
        placeholder="Search spaces..."
        info="Select the space where the object will be created"
      >
        {spaces?.map((space) => (
          <Form.Dropdown.Item key={space.id} value={space.id} title={space.name} icon={space.icon} />
        ))}
      </Form.Dropdown>

      <Form.Dropdown
        id="type"
        title="Type"
        value={selectedType}
        onChange={setSelectedType}
        storeValue={true} // TODO: does not work
        placeholder={`Search types in '${spaces.find((space) => space.id === selectedSpace)?.name}'...`}
        info="Select the type of object to create"
      >
        {types.map((type) => (
          <Form.Dropdown.Item key={type.id} value={type.id} title={type.name} icon={type.icon} />
        ))}
      </Form.Dropdown>

      <Form.Dropdown
        id="template"
        title="Template"
        value={selectedTemplate}
        onChange={setSelectedTemplate}
        storeValue={true}
        placeholder={`Search templates for '${types.find((type) => type.id === selectedType)?.name}'...`}
        info="Select the template to use for the object"
      >
        <Form.Dropdown.Item key="none" value="" title="No Template" icon={Icon.Dot} />
        {templates.map((template) => (
          <Form.Dropdown.Item key={template.id} value={template.id} title={template.name} icon={template.icon} />
        ))}
      </Form.Dropdown>

      <Form.Dropdown
        id="list"
        title="Collection"
        value={selectedList}
        onChange={setSelectedList}
        onSearchTextChange={setListSearchText}
        throttle={true}
        storeValue={true}
        placeholder={`Search collections in '${spaces.find((space) => space.id === selectedSpace)?.name}'...`}
        info="Select the collection where the object will be added"
      >
        {!listSearchText && <Form.Dropdown.Item key="none" value="" title="No Collection" icon={Icon.Dot} />}
        {lists.map((list) => (
          <Form.Dropdown.Item key={list.id} value={list.id} title={list.name} icon={list.icon} />
        ))}
      </Form.Dropdown>

      <Form.Separator />

      {hasSelectedSpaceAndType && (
        <>
          {selectedTypeUniqueKey === "ot-bookmark" ? (
            <Form.TextField
              {...itemProps.source}
              title="URL"
              placeholder="Add link"
              info="Provide the source URL for the bookmark"
            />
          ) : (
            <>
              {!["ot-note"].includes(selectedTypeUniqueKey) && (
                <Form.TextField
                  {...itemProps.name}
                  title="Name"
                  placeholder="Add a name"
                  info="Enter the name of the object"
                />
              )}
              {!["ot-task", "ot-note", "ot-profile"].includes(selectedTypeUniqueKey) && (
                <Form.TextField
                  {...itemProps.icon}
                  title="Icon"
                  placeholder="Add an emoji"
                  info="Enter a single emoji character to represent the object"
                />
              )}
              <Form.TextField
                {...itemProps.description}
                title="Description"
                placeholder="Add a description"
                info="Provide a brief description of the object"
              />
              {!typeKeysForLists.includes(selectedTypeUniqueKey) && (
                <Form.TextArea
                  {...itemProps.body}
                  title="Body"
                  placeholder="Add text in markdown"
                  info="Parses markdown to Anytype Blocks.

It supports:
- Headings, subheadings, and paragraphs
- Number, bullet, and checkbox lists
- Code blocks, blockquotes, and tables
- Text formatting: bold, italics, strikethrough, inline code, hyperlinks"
                />
              )}

              <Form.Separator />

              {properties.map((prop) => {
                const tags = tagsMap[prop.key] ?? []; // TODO: change to id
                const id = prop.key;
                const title = prop.name;
                if (prop.format === "text") {
                  return (
                    <Form.TextField
                      {...itemProps[id as keyof typeof itemProps]}
                      title={title}
                      placeholder="Add text"
                      value={
                        itemProps[id as keyof typeof itemProps].value !== null
                          ? String(itemProps[id as keyof typeof itemProps].value)
                          : undefined
                      }
                      defaultValue={
                        itemProps[id as keyof typeof itemProps].value !== null
                          ? String(itemProps[id as keyof typeof itemProps].value)
                          : undefined
                      }
                    />
                  );
                }
                if (prop.format === "number") {
                  return (
                    <Form.TextField
                      {...itemProps[id as keyof typeof itemProps]}
                      title={title}
                      placeholder="Add number"
                      value={
                        itemProps[id as keyof typeof itemProps].value !== null
                          ? String(itemProps[id as keyof typeof itemProps].value)
                          : undefined
                      }
                      defaultValue={
                        itemProps[id as keyof typeof itemProps].value !== null
                          ? String(itemProps[id as keyof typeof itemProps].value)
                          : undefined
                      }
                    />
                  );
                }
                if (prop.format === "select") {
                  return (
                    <Form.Dropdown
                      {...itemProps[id as keyof typeof itemProps]}
                      title={title}
                      placeholder="Select tag"
                      value={
                        itemProps[id as keyof typeof itemProps].value !== undefined
                          ? String(itemProps[id as keyof typeof itemProps].value)
                          : undefined
                      }
                      defaultValue={
                        itemProps[id as keyof typeof itemProps].value !== undefined
                          ? String(itemProps[id as keyof typeof itemProps].value)
                          : undefined
                      }
                    >
                      {tags.map((tag) => (
                        <Form.Dropdown.Item
                          key={tag.id}
                          value={tag.id}
                          title={tag.name}
                          icon={{ source: "icons/property/tag.svg", tintColor: tag.color }}
                        />
                      ))}
                    </Form.Dropdown>
                  );
                }
                if (prop.format === "multi_select") {
                  return (
                    <Form.TagPicker
                      {...itemProps[id as keyof typeof itemProps]}
                      title={title}
                      placeholder="Select tags"
                      value={
                        itemProps[id as keyof typeof itemProps].value !== undefined
                          ? (itemProps[id as keyof typeof itemProps].value as string[])
                          : undefined
                      }
                      defaultValue={
                        itemProps[id as keyof typeof itemProps].value !== undefined
                          ? (itemProps[id as keyof typeof itemProps].value as string[])
                          : undefined
                      }
                    >
                      {tags.map((tag) => (
                        <Form.TagPicker.Item
                          key={tag.id}
                          value={tag.id}
                          title={tag.name}
                          icon={{ source: "icons/property/tag.svg", tintColor: tag.color }}
                        />
                      ))}
                    </Form.TagPicker>
                  );
                }
                if (prop.format === "date") {
                  return (
                    <Form.DatePicker
                      {...itemProps[id as keyof typeof itemProps]}
                      title={title}
                      value={
                        itemProps[id as keyof typeof itemProps].value !== undefined
                          ? (itemProps[id as keyof typeof itemProps].value as Date)
                          : undefined
                      }
                      defaultValue={
                        itemProps[id as keyof typeof itemProps].value !== undefined
                          ? (itemProps[id as keyof typeof itemProps].value as Date)
                          : undefined
                      }
                    />
                  );
                }
                if (prop.format === "checkbox") {
                  return (
                    <Form.Checkbox
                      {...itemProps[id as keyof typeof itemProps]}
                      title={title}
                      label=""
                      value={Boolean(itemProps[id as keyof typeof itemProps].value)}
                      defaultValue={Boolean(itemProps[id as keyof typeof itemProps].value)}
                    />
                  );
                }
                return null;
              })}
            </>
          )}
        </>
      )}
    </Form>
  );
}
