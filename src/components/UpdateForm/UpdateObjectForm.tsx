import { Action, ActionPanel, Form, Icon, popToRoot, showToast, Toast } from "@raycast/api";
import { showFailureToast, useForm } from "@raycast/utils";
import { formatRFC3339 } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { FieldValue, getNumberFieldValidations } from "..";
import { updateObject } from "../../api";
import { useObject, useSearch, useTagsMap } from "../../hooks";
import { IconFormat, PropertyFormat, PropertyLinkWithValue, SpaceObject, UpdateObjectRequest } from "../../models";
import { apiPropertyKeys, defaultTintColor, isEmoji } from "../../utils";

interface UpdateObjectFormProps {
  spaceId: string;
  object: SpaceObject;
}

interface UpdateObjectFormValues {
  name?: string;
  icon?: string;
  description?: string;
  [key: string]: FieldValue;
}

export function UpdateObjectForm({ spaceId, object: initialObject }: UpdateObjectFormProps) {
  const [objectSearchText, setObjectSearchText] = useState("");

  const {
    object: fullObject,
    isLoadingObject: isLoadingFullObject,
    objectError: fullObjectError,
  } = useObject(spaceId, initialObject.id);

  const sourceObject = fullObject ?? initialObject;

  const properties =
    sourceObject.properties.filter((p) => ![apiPropertyKeys.description, apiPropertyKeys.type].includes(p.key)) || [];

  const numberFieldValidations = useMemo(() => getNumberFieldValidations(properties), [properties]);

  const { objects, objectsError, isLoadingObjects } = useSearch(spaceId, objectSearchText, []);
  const {
    tagsMap = {},
    tagsError,
    isLoadingTags,
  } = useTagsMap(
    spaceId,
    properties
      .filter((prop) => prop.format === PropertyFormat.Select || prop.format === PropertyFormat.MultiSelect)
      .map((prop) => prop.id),
  );

  useEffect(() => {
    if (fullObjectError || objectsError || tagsError) {
      showFailureToast(objectsError || tagsError, { title: "Failed to load data" });
    }
  }, [fullObjectError, objectsError, tagsError]);

  // Map existing property entries to form field values
  const initialPropertyValues: Record<string, FieldValue> = properties.reduce(
    (acc, prop) => {
      const entry = sourceObject.properties.find((p) => p.key === prop.key);
      if (entry) {
        let v: FieldValue;
        switch (prop.format) {
          case PropertyFormat.Text:
            v = entry.text ?? "";
            break;
          case PropertyFormat.Select:
            v = entry.select?.id ?? "";
            break;
          case PropertyFormat.Url:
            v = entry.url ?? "";
            break;
          case PropertyFormat.Email:
            v = entry.email ?? "";
            break;
          case PropertyFormat.Phone:
            v = entry.phone ?? "";
            break;
          case PropertyFormat.Number:
            v = entry.number ?? "";
            break;
          case PropertyFormat.MultiSelect:
            v = entry.multi_select?.map((tag) => tag.id) ?? [];
            break;
          case PropertyFormat.Date:
            v = entry.date ? new Date(entry.date) : undefined;
            break;
          case PropertyFormat.Checkbox:
            v = entry.checkbox ?? false;
            break;
          case PropertyFormat.Files:
            v = entry.files?.map((file) => file.id) ?? [];
            break;
          case PropertyFormat.Objects:
            v = entry.objects?.map((object) => object.id) ?? [];
            break;
          default:
            v = undefined;
        }
        acc[prop.key] = v;
      }
      return acc;
    },
    {} as Record<string, FieldValue>,
  );

  // Extract existing description
  const descriptionEntry = sourceObject.properties.find((p) => p.key === apiPropertyKeys.description);

  const initialValues: UpdateObjectFormValues = {
    name: sourceObject.name,
    icon: sourceObject.icon?.emoji ?? "",
    description: descriptionEntry?.text ?? "",
    ...initialPropertyValues,
  };

  const { handleSubmit, itemProps } = useForm<UpdateObjectFormValues>({
    initialValues: initialValues,
    onSubmit: async (values) => {
      try {
        await showToast({ style: Toast.Style.Animated, title: "Updating object…" });

        // Build the properties payload
        const propertiesEntries: PropertyLinkWithValue[] = [];
        properties.forEach((prop) => {
          const raw = itemProps[prop.key as keyof UpdateObjectFormValues]?.value;
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
                {
                  const date = raw instanceof Date ? raw : new Date(String(raw));
                  if (!isNaN(date.getTime())) {
                    entry.date = formatRFC3339(date);
                  } else {
                    console.warn(`Invalid date value for property ${prop.key}:`, raw);
                  }
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
                console.warn(`Unsupported property format: ${prop.format}`);
                break;
            }
            propertiesEntries.push(entry);
          }
        });
        const descriptionRaw = itemProps[apiPropertyKeys.description]?.value;
        if (descriptionRaw !== undefined && descriptionRaw !== null && descriptionRaw !== "") {
          propertiesEntries.push({
            key: apiPropertyKeys.description,
            text: String(descriptionRaw),
          });
        }

        const payload: UpdateObjectRequest = {
          name: values.name || "",
          icon: { format: IconFormat.Emoji, emoji: values.icon || "" },
          properties: propertiesEntries,
        };

        const resp = await updateObject(spaceId, sourceObject.id, payload);
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
        if (!["ot-bookmark", "ot-note"].includes(sourceObject.type.key) && !s) {
          return "Name is required";
        }
      },
      icon: (v: FieldValue) => {
        if (typeof v === "string" && v && !isEmoji(v)) {
          return "Icon must be a single emoji";
        }
      },
      ...numberFieldValidations,
    },
  });

  return (
    <Form
      navigationTitle={`Edit ${sourceObject.type.name}`}
      isLoading={isLoadingObjects || isLoadingTags || isLoadingFullObject}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Changes" icon={Icon.Check} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      {!["ot-note"].includes(sourceObject.type.key) && (
        <Form.TextField {...itemProps.name} title="Name" placeholder="Add name" />
      )}
      {!["ot-task", "ot-note", "ot-profile"].includes(sourceObject.type.key) && (
        <Form.TextField {...itemProps.icon} title="Icon" />
      )}
      <Form.TextField {...itemProps.description} title="Description" placeholder="Add a brief description" />

      <Form.Separator />

      {properties.map((prop) => {
        const tags = tagsMap[prop.id] ?? [];
        const id = prop.key as keyof typeof itemProps;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { value, defaultValue, ...restItemProps } = itemProps[id];

        switch (prop.format) {
          case PropertyFormat.Text:
          case PropertyFormat.Url:
          case PropertyFormat.Email:
          case PropertyFormat.Phone:
            return (
              <Form.TextField
                key={prop.key}
                {...restItemProps}
                title={prop.name}
                placeholder="Add text"
                value={value != null ? String(value) : undefined}
              />
            );
          case PropertyFormat.Number:
            return (
              <Form.TextField
                key={prop.key}
                {...restItemProps}
                title={prop.name}
                placeholder="Add number"
                value={value != null ? String(value) : undefined}
              />
            );
          case PropertyFormat.Select:
            return (
              <Form.Dropdown
                key={prop.key}
                {...restItemProps}
                title={prop.name}
                value={value !== undefined ? String(value) : undefined}
                placeholder={`Select tags for ${prop.name}`}
              >
                <Form.Dropdown.Item
                  key="none"
                  value=""
                  title="No Tag"
                  icon={{ source: "icons/type/pricetag.svg", tintColor: defaultTintColor }}
                />
                {tags.map((tag) => (
                  <Form.Dropdown.Item
                    key={tag.id}
                    value={tag.id}
                    title={tag.name}
                    icon={{ source: "icons/type/pricetag.svg", tintColor: tag.color }}
                  />
                ))}
              </Form.Dropdown>
            );
          case PropertyFormat.MultiSelect:
            return (
              <Form.TagPicker
                key={prop.key}
                {...restItemProps}
                title={prop.name}
                value={value !== undefined ? (value as string[]) : undefined}
                placeholder="Add tags"
              >
                {tags.map((tag) => (
                  <Form.TagPicker.Item
                    key={tag.id}
                    value={tag.id}
                    title={tag.name}
                    icon={{ source: "icons/type/pricetag.svg", tintColor: tag.color }}
                  />
                ))}
              </Form.TagPicker>
            );
          case PropertyFormat.Date:
            return (
              <Form.DatePicker
                key={prop.key}
                {...restItemProps}
                title={prop.name}
                value={value !== undefined ? (value as Date) : undefined}
              />
            );
          case PropertyFormat.Files:
            // TODO: implement file picker
            return null;
          case PropertyFormat.Checkbox:
            return (
              <Form.Checkbox key={prop.key} {...restItemProps} label="" title={prop.name} value={Boolean(value)} />
            );
          case PropertyFormat.Objects:
            return (
              <Form.Dropdown
                key={prop.key}
                {...restItemProps}
                title={prop.name}
                value={value !== undefined ? String(value) : undefined}
                onSearchTextChange={setObjectSearchText}
                throttle={true}
                placeholder="Select object"
              >
                {!objectSearchText && (
                  <Form.Dropdown.Item
                    key="none"
                    value=""
                    title="No Object"
                    icon={{ source: "icons/type/document.svg", tintColor: defaultTintColor }}
                  />
                )}
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
