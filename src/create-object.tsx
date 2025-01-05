import { Toast, showToast, LaunchProps } from "@raycast/api";
import { useEffect, useState } from "react";
import { useSpaces } from "./hooks/useSpaces";
import { useTypes } from "./hooks/useTypes";
import CreateObjectForm, { CreateObjectFormValues } from "./components/CreateObjectForm";

interface CreateObjectProps extends LaunchProps<{ draftValues: CreateObjectFormValues }> {}

export default function CreateObject({ draftValues }: CreateObjectProps) {
  const [selectedSpace, setSelectedSpace] = useState(draftValues?.space || "");
  const { spaces, spacesError, isLoadingSpaces } = useSpaces();
  const { types, typesError, isLoadingTypes } = useTypes(selectedSpace);

  useEffect(() => {
    if (Array.isArray(spaces) && spaces.length > 0 && !selectedSpace) {
      setSelectedSpace(spaces[0].id);
    }
  }, [spaces]);

  useEffect(() => {
    if (spacesError) {
      showToast(Toast.Style.Failure, "Failed to fetch Spaces", spacesError.message);
    }
  }, [spacesError]);

  useEffect(() => {
    if (typesError) {
      showToast(Toast.Style.Failure, "Failed to fetch Types", typesError.message);
    }
  }, [typesError]);

  return (
    <CreateObjectForm
      spaces={spaces || []}
      objectTypes={types || []}
      selectedSpace={selectedSpace}
      setSelectedSpace={setSelectedSpace}
      isLoading={isLoadingSpaces || isLoadingTypes}
      draftValues={draftValues as CreateObjectFormValues}
    />
  );
}
