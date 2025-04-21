import { Action, ActionPanel, Form, Icon, popToRoot, showToast, Toast } from "@raycast/api";
import { showFailureToast, useForm } from "@raycast/utils";
import { createProperty } from "../../api";
import { PropertyFormat } from "../../models";

export interface CreatePropertyFormValues {
  name: string;
  format?: PropertyFormat;
}

interface CreatePropertyFormProps {
  spaceId: string;
  draftValues: CreatePropertyFormValues;
}

export function CreatePropertyForm({ spaceId, draftValues }: CreatePropertyFormProps) {
  const { handleSubmit, itemProps } = useForm<CreatePropertyFormValues>({
    initialValues: { ...draftValues, format: draftValues.format as PropertyFormat },
    onSubmit: async (values) => {
      try {
        await showToast({ style: Toast.Style.Animated, title: "Creating property..." });

        await createProperty(spaceId, {
          name: values.name || "",
          format: values.format || PropertyFormat.Text,
        });

        showToast(Toast.Style.Success, "Property created successfully");
        popToRoot();
      } catch (error) {
        await showFailureToast(error, { title: "Failed to create property" });
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

  const propertyFormatKeys = Object.keys(PropertyFormat) as Array<keyof typeof PropertyFormat>;

  return (
    <Form
      navigationTitle="Create Property"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Property" icon={Icon.Plus} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        {...itemProps.name}
        title="Name"
        placeholder="Enter property name"
        info="The name of the property"
      />
      <Form.Dropdown
        {...itemProps.format}
        title="Format"
        info="The format of the property"
        onBlur={(event) => {
          const formatValue = event.target.value as PropertyFormat;
          itemProps.format.onChange?.(formatValue);
        }}
        onChange={(newValue) => {
          const formatValue = newValue as PropertyFormat;
          itemProps.format.onChange?.(formatValue);
        }}
        onFocus={(event) => {
          const formatValue = event.target.value as PropertyFormat;
          itemProps.format.onChange?.(formatValue);
        }}
      >
        {propertyFormatKeys.map((key) => {
          const value = PropertyFormat[key];
          return (
            <Form.Dropdown.Item key={key} value={value} title={key} icon={{ source: `icons/property/${value}.svg` }} />
          );
        })}
      </Form.Dropdown>
    </Form>
  );
}
