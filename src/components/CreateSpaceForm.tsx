import { Action, ActionPanel, Form, Icon, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { createSpace } from "../api/createSpace";

export default function CreateSpaceForm() {
  const [spaceName, setSpaceName] = useState("");

  const handleSubmit = async () => {
    if (!spaceName) {
      showToast(Toast.Style.Failure, "Space name is required");
      return;
    }

    try {
      await createSpace({ name: spaceName });
      showToast(Toast.Style.Success, "Space created successfully");
    } catch (error) {
      if (error instanceof Error) {
        showToast(Toast.Style.Failure, "Failed to create space", error.message);
      } else {
        showToast(Toast.Style.Failure, "Failed to create space", "Unknown error");
      }
    }
  };

  return (
    <Form
      navigationTitle="Create Space"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Space" icon={Icon.Plus} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="spaceName"
        title="Space Name"
        placeholder="Enter space name"
        value={spaceName}
        onChange={setSpaceName}
      />
    </Form>
  );
}
