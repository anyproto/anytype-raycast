import {
  ActionPanel,
  Action,
  Form,
  showToast,
  Toast,
  popToRoot,
} from "@raycast/api";
import { useState } from "react";
import * as A from "./hooks/api";

export default function CreateSpace() {
  const [loading, setLoading] = useState(false);
  const [spaceName, setSpaceName] = useState("");

  async function handleSubmit() {
    setLoading(true);
    try {
      await A.createSpace({ name: spaceName });
      await showToast(Toast.Style.Success, "Space created successfully");
    } catch (error) {
      console.error("Error creating space:", error);
      await showToast(
        Toast.Style.Failure,
        "Failed to create space",
        (error as Error).message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form
      isLoading={loading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Create Space"
            onSubmit={async () => {
              await handleSubmit();
              if (!loading) {
                await showToast(
                  Toast.Style.Success,
                  "Space created successfully",
                );
                popToRoot();
              }
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="spaceName"
        title="Space Name"
        placeholder="Enter the name of the new space"
        value={spaceName}
        onChange={setSpaceName}
      />
    </Form>
  );
}
