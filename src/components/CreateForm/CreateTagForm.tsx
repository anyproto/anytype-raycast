import { Action, ActionPanel, Form, Icon, popToRoot, showToast, Toast } from "@raycast/api";
import { showFailureToast, useForm } from "@raycast/utils";
import { createTag } from "../../api";
import { Color } from "../../models";
import { colorMap } from "../../utils";

export interface CreateTagFormValues {
  name: string;
  color?: Color;
}

interface CreateTagFormProps {
  spaceId: string;
  propertyId: string;
  draftValues: CreateTagFormValues;
}

export function CreateTagForm({ spaceId, propertyId, draftValues }: CreateTagFormProps) {
  const { handleSubmit, itemProps } = useForm<CreateTagFormValues>({
    initialValues: { ...draftValues, color: draftValues.color as Color },
    onSubmit: async (values) => {
      try {
        await showToast({ style: Toast.Style.Animated, title: "Creating tag..." });

        await createTag(spaceId, propertyId, {
          name: values.name || "",
          color: values.color || Color.Ice,
        });

        showToast(Toast.Style.Success, "Tag created successfully");
        popToRoot();
      } catch (error) {
        await showFailureToast(error, { title: "Failed to create tag" });
      }
    },
    validation: {
      name: (value) => {
        if (!value) {
          return "Name is required";
        }
      },
    },
  });

  const tagColorKeys = Object.keys(Color) as Array<keyof typeof Color>;

  return (
    <Form
      navigationTitle="Create Tag"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Tag" icon={Icon.Plus} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField {...itemProps.name} title="Name" placeholder="Enter tag name" info="The name of the tag" />
      <Form.Dropdown
        {...itemProps.color}
        title="Format"
        info="The color of the tag"
        onBlur={(event) => {
          const colorValue = event.target.value as Color;
          itemProps.color.onChange?.(colorValue);
        }}
        onChange={(newValue) => {
          const colorValue = newValue as Color;
          itemProps.color.onChange?.(colorValue);
        }}
        onFocus={(event) => {
          const colorValue = event.target.value as Color;
          itemProps.color.onChange?.(colorValue);
        }}
      >
        {tagColorKeys.map((key) => {
          const value = Color[key];
          return (
            <Form.Dropdown.Item
              key={key}
              value={value}
              title={key}
              icon={{ source: Icon.Dot, tintColor: colorMap[value] }}
            />
          );
        })}
      </Form.Dropdown>
    </Form>
  );
}
