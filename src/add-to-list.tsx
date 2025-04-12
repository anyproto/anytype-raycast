import { Action, ActionPanel, Form, popToRoot, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { addObjectsToList } from "./api";
import { EnsureAuthenticated } from "./components/EnsureAuthenticated";
import { useSearch, useSpaces } from "./hooks";

export default function Command() {
  return (
    <EnsureAuthenticated viewType="form">
      <AddToList />
    </EnsureAuthenticated>
  );
}

export function AddToList() {
  const [loading, setLoading] = useState(false);
  const [listSearchText, setListSearchText] = useState("");
  const [objectSearchText, setObjectSearchText] = useState("");
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [selectedList, setSelectedList] = useState<string>("");
  const [selectedObject, setSelectedObject] = useState<string>("");

  const { spaces, spacesError, isLoadingSpaces } = useSpaces();
  const {
    objects: lists,
    objectsError: listsError,
    isLoadingObjects: isLoadingLists,
  } = useSearch(selectedSpace, listSearchText, ["ot-collection"]);
  const { objects, objectsError, isLoadingObjects } = useSearch(selectedSpace, objectSearchText, []);

  useEffect(() => {
    if (spacesError || objectsError || listsError) {
      showToast(
        Toast.Style.Failure,
        "Failed to fetch latest data",
        spacesError?.message || objectsError?.message || listsError?.message,
      );
    }
  }, [spacesError, objectsError, listsError]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await showToast(Toast.Style.Animated, "Adding object to list...");
      const response = await addObjectsToList(selectedSpace, selectedList, [selectedObject]);

      if (response.payload) {
        await showToast(Toast.Style.Success, "Object added to list successfully", response.payload);
        popToRoot();
      } else {
        await showToast(Toast.Style.Failure, "Failed to add object to list");
      }
    } catch (error) {
      await showToast(Toast.Style.Failure, "Failed to add object to list", String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      isLoading={loading || isLoadingSpaces || isLoadingObjects || isLoadingLists}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add to List" onSubmit={handleSubmit} />
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
        info="The space containing the list"
      >
        {spaces.map((space) => (
          <Form.Dropdown.Item key={space.id} value={space.id} title={space.name} icon={space.icon} />
        ))}
      </Form.Dropdown>

      <Form.Dropdown
        id="list"
        title="Collection"
        value={selectedList}
        onChange={setSelectedList}
        onSearchTextChange={setListSearchText}
        storeValue={true}
        placeholder="Search collections..."
        info="The list to add the object to"
      >
        {lists.map((list) => (
          <Form.Dropdown.Item key={list.id} value={list.id} title={list.name} icon={list.icon} />
        ))}
      </Form.Dropdown>

      <Form.Dropdown
        id="object"
        title="Object"
        value={selectedObject}
        onChange={setSelectedObject}
        onSearchTextChange={setObjectSearchText}
        throttle={true}
        storeValue={true}
        info="The object to add to the list"
      >
        {objects.map((object) => (
          <Form.Dropdown.Item key={object.id} value={object.id} title={object.name} icon={object.icon} />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
