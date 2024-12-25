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
    console.error("Failed to fetch spaces:", spacesError);
  }

  if (typesError) {
    console.error("Failed to fetch types for space:", typesError);
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
