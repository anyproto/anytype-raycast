import CreateObjectForm from "./components/CreateObjectForm";
import { useState, useEffect } from "react";
import * as A from "./hooks/api";

export default function CreateObject() {
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const {
    data: spaces,
    isLoading: spacesLoading,
    error: spacesError,
  } = A.useGetSpaces();
  const {
    data: objectTypes,
    isLoading: objectTypesLoading,
    error: objectTypesError,
  } = A.useGetObjectTypes(selectedSpace);

  useEffect(() => {
    if (spaces && spaces.length > 0 && !selectedSpace) {
      setSelectedSpace(spaces[0].id);
    }
  }, [spaces]);

  if (spacesError) {
    console.error("Failed to fetch spaces:", spacesError);
  }

  if (objectTypesError) {
    console.error("Failed to fetch object types for space:", objectTypesError);
  }

  return (
    <CreateObjectForm
      spaces={spaces || []}
      objectTypes={objectTypes || []}
      selectedSpace={selectedSpace}
      setSelectedSpace={setSelectedSpace}
      isLoading={spacesLoading || objectTypesLoading}
    />
  );
}
