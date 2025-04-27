import { Action, ActionPanel, Form, Icon, popToRoot, showToast, Toast } from "@raycast/api";
import { showFailureToast, useForm } from "@raycast/utils";
import { formatRFC3339 } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { addObjectsToList, createObject } from "../../api";
import { CreateObjectFormValues } from "../../create-object";
import { useCreateObjectData, useTagsMap } from "../../hooks";
import { CreateObjectRequest, IconFormat, PropertyEntry, PropertyFormat } from "../../models";
import { apiPropertyKeys, fetchTypeKeysForLists, isEmoji } from "../../utils";

interface CreateObjectFormProps {
  draftValues: CreateObjectFormValues;
  enableDrafts: boolean;
}

type FieldValue = string | boolean | string[] | Date | null | undefined;

export function CreateObjectForm({ draftValues, enableDrafts }: CreateObjectFormProps) {
  const {
    spaces,
    types,
    templates,
    lists,
    objects,
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
    objectSearchText,
    setObjectSearchText,
    isLoading,
  } = useCreateObjectData(draftValues);

  const [loading, setLoading] = useState(false);
  const [typeKeysForLists, setTypeKeysForLists] = useState<string[]>([]);
  const hasSelectedSpaceAndType = selectedSpace && selectedType;
  const selectedTypeUniqueKey = useMemo(
    () => types.reduce((acc, type) => (type.id === selectedType ? type.key : acc), ""),
    [types, selectedType],
  );

  // Fetch tags for all properties in one hook call
  const selectedTypeDef = types.find((type) => type.id === selectedType);
  const properties =
    selectedTypeDef?.properties.filter(
      (prop) => ![apiPropertyKeys.description, apiPropertyKeys.type].includes(prop.key),
    ) || []; // handle description and type separately
  const { tagsMap = {} } = useTagsMap(
    selectedSpace,
    properties
      .filter((prop) => prop.format === PropertyFormat.Select || prop.format === PropertyFormat.MultiSelect)
      .map((prop) => prop.id),
  );

  const numberFieldValidations = useMemo(() => {
    return properties
      .filter((prop) => prop.format === PropertyFormat.Number)
      .reduce(
        (acc, prop) => {
          acc[prop.key] = (value: FieldValue) => {
            const str = typeof value === "string" ? value : undefined;
            if (str && isNaN(Number(str))) {
              return "Value must be a number";
            }
          };
          return acc;
        },
        {} as Record<string, (value: FieldValue) => string | undefined>,
      );
  }, [properties]);

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
        const propertiesEntries: PropertyEntry[] = [];
        properties.forEach((prop) => {
          const raw = itemProps[prop.key as keyof typeof itemProps]?.value;
          if (raw !== undefined && raw !== null && raw !== "" && raw !== false) {
            const entry: PropertyEntry = { key: prop.key };
            switch (prop.format) {
              case PropertyFormat.Text:
                entry.text = String(raw);
                break;
              case PropertyFormat.Select:
                entry.select = String(raw);
                break;
              case PropertyFormat.Url:
                entry.url = String(raw);
                break;
              case PropertyFormat.Email:
                entry.email = String(raw);
                break;
              case PropertyFormat.Phone:
                entry.phone = String(raw);
                break;
              case PropertyFormat.Number:
                entry.number = Number(raw);
                break;
              case PropertyFormat.MultiSelect:
                entry.multi_select = raw as string[];
                break;
              case PropertyFormat.Date:
                if (raw instanceof Date && !isNaN(raw.getTime())) {
                  entry.date = formatRFC3339(raw);
                }
                break;
              case PropertyFormat.Checkbox:
                entry.checkbox = Boolean(raw);
                break;
              case PropertyFormat.Files:
                entry.files = Array.isArray(raw) ? (raw as string[]) : [String(raw)];
                break;
              case PropertyFormat.Objects:
                entry.objects = Array.isArray(raw) ? (raw as string[]) : [String(raw)];
                break;
              default:
            }
            propertiesEntries.push(entry);
          }
        });

        // Append description to properties
        const descriptionValue = itemProps[apiPropertyKeys.description]?.value;
        if (descriptionValue !== undefined && descriptionValue !== null && descriptionValue !== "") {
          propertiesEntries.push({
            key: apiPropertyKeys.description,
            text: String(descriptionValue),
          });
        }

        const objectData: CreateObjectRequest = {
          name: values.name || "",
          icon: { format: IconFormat.Emoji, emoji: values.icon || "" },
          body: values.body || "",
          source: values.source || "",
          template_id: values.template || "",
          type_key: selectedTypeUniqueKey,
          properties: propertiesEntries,
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
        await showFailureToast(error, { title: "Failed to create object" });
      } finally {
        setLoading(false);
      }
    },
    validation: {
      name: (v: FieldValue) => {
        const s = typeof v === "string" ? v.trim() : undefined;
        if (!["ot-bookmark", "ot-note"].includes(selectedTypeUniqueKey) && !s) {
          return "Name is required";
        }
      },
      icon: (v: FieldValue) => {
        if (typeof v === "string" && v && !isEmoji(v)) {
          return "Icon must be single emoji";
        }
      },
      source: (v: FieldValue) => {
        const s = typeof v === "string" ? v.trim() : undefined;
        if (selectedTypeUniqueKey === "ot-bookmark" && !s) {
          return "Source is required for Bookmarks";
        }
      },
      ...numberFieldValidations,
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
        onChange={(v) => {
          setSelectedSpace(v);
          setSelectedType("");
          setSelectedTemplate("");
          setSelectedList("");
          setListSearchText("");
          setObjectSearchText("");
        }}
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
        storeValue={true} // TODO: storeValue does not work here
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
                const tags = tagsMap[prop.id] ?? [];
                const id = prop.key;
                const title = prop.name;
                const value = itemProps[id].value;
                if (
                  [PropertyFormat.Text, PropertyFormat.Url, PropertyFormat.Email, PropertyFormat.Phone].includes(
                    prop.format,
                  )
                ) {
                  return (
                    <Form.TextField
                      {...itemProps[id as keyof typeof itemProps]}
                      title={title}
                      placeholder="Add text"
                      value={value !== null ? String(value) : undefined}
                      defaultValue={value !== null ? String(value) : undefined}
                    />
                  );
                }
                if (prop.format === PropertyFormat.Number) {
                  return (
                    <Form.TextField
                      {...itemProps[id as keyof typeof itemProps]}
                      title={title}
                      placeholder="Add number"
                      value={value !== null ? String(value) : undefined}
                      defaultValue={value !== null ? String(value) : undefined}
                    />
                  );
                }
                if (prop.format === PropertyFormat.Select) {
                  return (
                    <Form.Dropdown
                      {...itemProps[id as keyof typeof itemProps]}
                      title={title}
                      placeholder="Select tag"
                      value={value !== undefined ? String(value) : undefined}
                      defaultValue={value !== undefined ? String(value) : undefined}
                    >
                      <Form.Dropdown.Item key="none" value="" title="No Tag" icon={Icon.Dot} />
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
                if (prop.format === PropertyFormat.MultiSelect) {
                  return (
                    <Form.TagPicker
                      {...itemProps[id as keyof typeof itemProps]}
                      title={title}
                      placeholder="Select tags"
                      value={value !== undefined ? (value as string[]) : undefined}
                      defaultValue={value !== undefined ? (value as string[]) : undefined}
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
                if (prop.format === PropertyFormat.Date) {
                  return (
                    <Form.DatePicker
                      {...itemProps[id as keyof typeof itemProps]}
                      title={title}
                      value={value !== undefined ? (value as Date) : undefined}
                      defaultValue={value !== undefined ? (value as Date) : undefined}
                    />
                  );
                }
                if (prop.format === PropertyFormat.Files) {
                  // TODO: implement
                  return null;
                }
                if (prop.format === PropertyFormat.Checkbox) {
                  return (
                    <Form.Checkbox
                      {...itemProps[id as keyof typeof itemProps]}
                      title={title}
                      label=""
                      value={Boolean(value)}
                      defaultValue={Boolean(value)}
                    />
                  );
                }
                if (prop.format === PropertyFormat.Objects) {
                  return (
                    // TODO: TagPicker would be the more appropriate component, but it does not support onSearchTextChange
                    <Form.Dropdown
                      {...itemProps[id as keyof typeof itemProps]}
                      title={title}
                      placeholder="Select objects"
                      value={value !== undefined ? String(value) : undefined}
                      defaultValue={value !== undefined ? String(value) : undefined}
                      onSearchTextChange={setObjectSearchText}
                      throttle={true}
                    >
                      {!objectSearchText && (
                        <Form.Dropdown.Item key="none" value="" title="No Object" icon={Icon.Dot} />
                      )}
                      {objects.map((object) => (
                        <Form.Dropdown.Item key={object.id} value={object.id} title={object.name} icon={object.icon} />
                      ))}
                    </Form.Dropdown>
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
