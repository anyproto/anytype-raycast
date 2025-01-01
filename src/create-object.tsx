import { Toast, showToast } from "@raycast/api";
import CreateObjectForm from "./components/CreateObjectForm";
import { useState, useEffect } from "react";
import { useSpaces } from "./hooks/useSpaces";
import { useTypes } from "./hooks/useTypes";

export default function CreateObject() {
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const { spaces, spacesError, isLoadingSpaces } = useSpaces();
  const { types, typesError, isLoadingTypes } = useTypes(selectedSpace);

  useEffect(() => {
    if (Array.isArray(spaces) && spaces.length > 0 && !selectedSpace) {
      setSelectedSpace(spaces[0].id);
    }
  }, [spaces]);

  if (spacesError) {
    showToast(Toast.Style.Failure, "Failed to fetch spaces", spacesError.message);
  }

  if (typesError) {
    showToast(Toast.Style.Failure, "Failed to fetch types", typesError.message);
  }

  return (
    <CreateObjectForm
      spaces={spaces || []}
      objectTypes={types || []}
      selectedSpace={selectedSpace}
      setSelectedSpace={setSelectedSpace}
      isLoading={isLoadingSpaces || isLoadingTypes}
    />
  );
}
