import { Action, ActionPanel, Form, Icon, popToRoot, showToast, Toast } from "@raycast/api";
import { showFailureToast, useForm } from "@raycast/utils";
import { formatRFC3339 } from "date-fns";
import { useEffect, useState } from "react";
import { FieldValue } from "..";
import { updateObject } from "../../api";
import { useSearch, useTagsMap } from "../../hooks";
import { IconFormat, PropertyFormat, PropertyLinkWithValue, SpaceObject, UpdateObjectRequest } from "../../models";
import { apiPropertyKeys, isEmoji } from "../../utils";

interface UpdateObjectFormProps {
  spaceId: string;
  object: SpaceObject;
}

interface UpdateObjectFormValues {
  name?: string;
  icon?: string;
  description?: string;
}

export function UpdateObjectForm({ spaceId, object }: UpdateObjectFormProps) {
  const [objectSearchText, setObjectSearchText] = useState("");

  const customProps = object.type.properties.filter(
    (p) => ![apiPropertyKeys.description, apiPropertyKeys.type].includes(p.key),
  );

  const { objects, objectsError, isLoadingObjects } = useSearch(spaceId, objectSearchText, []);
  const { tagsMap, tagsError, isLoadingTags } = useTagsMap(
    spaceId,
    customProps
      .filter((prop) => prop.format === PropertyFormat.Select || prop.format === PropertyFormat.MultiSelect)
      .map((prop) => prop.id),
  );

  useEffect(() => {
    if (objectsError || tagsError) {
      showFailureToast(objectsError || tagsError, { title: "Failed to load data" });
    }
  }, [objectsError, tagsError]);

  const initialValues: UpdateObjectFormValues = {
    name: object.name,
    icon: object.icon?.emoji ?? "",
    ...object.properties,
  };

  const { handleSubmit, itemProps } = useForm<UpdateObjectFormValues>({
    initialValues: initialValues,
    onSubmit: async (values) => {
      try {
        await showToast({ style: Toast.Style.Animated, title: "Updating object…" });

        // Build the properties payload
        const propertiesEntries: PropertyLinkWithValue[] = [];
        customProps.forEach((prop) => {
          const raw = itemProps[prop.key as keyof typeof itemProps]?.value;
          if (raw !== undefined && raw !== null && raw !== "" && raw !== false) {
            const entry: PropertyLinkWithValue = { key: prop.key };
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

        const payload: UpdateObjectRequest = {
          name: values.name || "",
          icon: { format: IconFormat.Emoji, emoji: values.icon || "" },
          properties: propertiesEntries,
        };

        const resp = await updateObject(spaceId, object.id, payload);
        if (resp.object?.id) {
          await showToast(Toast.Style.Success, "Object updated");
          popToRoot();
        } else {
          await showToast(Toast.Style.Failure, "Update failed");
        }
      } catch (error) {
        await showFailureToast(error, { title: "Failed to update object" });
      }
    },
    validation: {
      name: (v: FieldValue) => {
        const s = typeof v === "string" ? v.trim() : "";
        if (!["ot-bookmark", "ot-note"].includes(object.type.key) && !s) {
          return "Name is required";
        }
      },
      icon: (v: FieldValue) => {
        if (typeof v === "string" && v && !isEmoji(v)) {
          return "Must be a single emoji";
        }
      },
    },
  });

  return (
    <Form
      navigationTitle={`Edit ${object.type.name}`}
      isLoading={isLoadingObjects || isLoadingTags}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Changes" icon={Icon.Check} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      {!["ot-note"].includes(object.type.key) && (
        <Form.TextField {...itemProps.name} title="Name" placeholder="Enter name" />
      )}
      {!["ot-task", "ot-note", "ot-profile"].includes(object.type.key) && (
        <Form.TextField {...itemProps.icon} title="Icon" />
      )}
      <Form.TextField {...itemProps.description} title="Description" placeholder="Enter a brief description" />

      <Form.Separator />

      {customProps.map((prop) => {
        const tags = tagsMap[prop.id] ?? [];
        const id = prop.key as keyof typeof itemProps;
        const value = itemProps[id].value;
        switch (prop.format) {
          case PropertyFormat.Text:
          case PropertyFormat.Url:
          case PropertyFormat.Email:
          case PropertyFormat.Phone:
            return (
              <Form.TextField
                {...itemProps[id]}
                title={prop.name}
                placeholder="Enter text"
                value={value != null ? String(value) : undefined}
              />
            );
          case PropertyFormat.Number:
            return (
              <Form.TextField
                {...itemProps[id]}
                title={prop.name}
                placeholder="Enter number"
                value={value != null ? String(value) : undefined}
              />
            );
          case PropertyFormat.Select:
            return (
              <Form.Dropdown {...itemProps[id]} title={prop.name}>
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
          case PropertyFormat.MultiSelect:
            return (
              <Form.TagPicker
                {...itemProps[id]}
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
          case PropertyFormat.Date:
            return <Form.DatePicker {...itemProps[id]} title={prop.name} />;
          case PropertyFormat.Files:
            // TODO: implement file picker
            return null;
          case PropertyFormat.Checkbox:
            return <Form.Checkbox {...itemProps[id]} title={prop.name} />;
          case PropertyFormat.Objects:
            return (
              <Form.Dropdown
                {...itemProps[id as keyof typeof itemProps]}
                title={prop.name}
                placeholder="Select objects"
                value={value !== undefined ? String(value) : undefined}
                defaultValue={value !== undefined ? String(value) : undefined}
                onSearchTextChange={setObjectSearchText}
                throttle={true}
              >
                {!objectSearchText && <Form.Dropdown.Item key="none" value="" title="No Object" icon={Icon.Dot} />}
                {objects.map((object) => (
                  <Form.Dropdown.Item key={object.id} value={object.id} title={object.name} icon={object.icon} />
                ))}
              </Form.Dropdown>
            );

          default:
            return null;
        }
      })}
    </Form>
  );
}
