import {
  ActionPanel,
  Action,
  Form,
  Icon,
  showToast,
  Toast,
  Image,
  popToRoot,
} from "@raycast/api";
import { useState } from "react";
import { useForm, FormValidation } from "@raycast/utils";
import { createObject } from "../api/createObject";
import { Space, Type } from "../utils/schemas";

type CreateObjectFormProps = {
  spaces: Space[];
  objectTypes: Type[];
  selectedSpace: string;
  setSelectedSpace: (spaceId: string) => void;
  isLoading: boolean;
};

type CreateObjectFormValues = {
  name: string;
  icon: string;
};

export default function CreateObjectForm({
  spaces,
  objectTypes,
  selectedSpace,
  setSelectedSpace,
  isLoading,
}: CreateObjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");

  const { handleSubmit, itemProps } = useForm<CreateObjectFormValues>({
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await showToast({
          style: Toast.Style.Animated,
          title: "Creating object...",
        });
        // TODO use template_id
        await createObject(selectedSpace, {
          icon: values.icon,
          name: values.name,
          template_id: "",
          object_type_unique_key: selectedType,
        });

        await showToast(Toast.Style.Success, "Object created successfully");
        popToRoot();
      } catch (error) {
        console.error("Error creating object:", error);
        await showToast(
          Toast.Style.Failure,
          "Failed to create object",
          (error as Error).message,
        );
      } finally {
        setLoading(false);
      }
    },
    validation: {
      name: FormValidation.Required,
      icon: (value) => {
        if (value && value.length > 2) {
          return "Icon must be a single character";
        }
      },
    },
  });

  return (
    <Form
      isLoading={loading || isLoading}
      actions={
        <ActionPanel title="Create New Object">
          <Action.SubmitForm
            title="Create Object"
            icon={Icon.Plus}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="space"
        title="Space"
        value={selectedSpace}
        onChange={setSelectedSpace}
      >
        {spaces?.map((space) => (
          <Form.Dropdown.Item
            key={space.id}
            value={space.id}
            title={space.name}
            icon={{
              source: space.icon,
              mask: Image.Mask.RoundedRectangle,
            }}
          />
        ))}
      </Form.Dropdown>
      <Form.Dropdown
        id="objectType"
        title="Object Type"
        value={selectedType}
        onChange={setSelectedType}
      >
        {objectTypes?.map((type) => (
          <Form.Dropdown.Item
            key={type.unique_key}
            value={type.unique_key}
            title={type.name}
            icon={type.icon}
          />
        ))}
      </Form.Dropdown>
      <Form.TextField
        title="Name"
        placeholder="Enter name of the object ..."
        {...itemProps.name}
      />
      <Form.TextField
        title="Icon"
        placeholder="Enter single emoji as icon ..."
        {...itemProps.icon}
      />
    </Form>
  );
}
