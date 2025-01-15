import { useEffect } from "react";
import { format } from "date-fns";
import { Detail, showToast, Toast, Image } from "@raycast/api";
import { useExport } from "../hooks/useExport";
import ObjectActions from "./ObjectActions";
import type { Detail as ObjectDetail, Member } from "../helpers/schemas";

type ObjectDetailProps = {
  spaceId: string;
  objectId: string;
  title: string;
  details: ObjectDetail[];
};

export default function ObjectDetail({ spaceId, objectId, title, details }: ObjectDetailProps) {
  const { objectExport, objectExportError, isLoadingObjectExport, mutateObjectExport } = useExport(
    spaceId,
    objectId,
    "markdown",
  );

  const createdDateDetail = details.find((detail) => detail.id === "createdDate");
  const createdDate = createdDateDetail?.details?.createdDate;

  const createdByDetail = details.find((detail) => detail.id === "createdBy");
  const createdBy = createdByDetail?.details?.details as Member | undefined;

  const lastModifiedDateDetail = details.find((detail) => detail.id === "lastModifiedDate");
  const lastModifiedDate = lastModifiedDateDetail?.details?.lastModifiedDate;

  const lastModifiedByDetail = details.find((detail) => detail.id === "lastModifiedBy");
  const lastModifiedBy = lastModifiedByDetail?.details?.details as Member | undefined;

  const tags = details.flatMap((detail) => detail.details.tags || []);

  useEffect(() => {
    if (objectExportError) {
      showToast(Toast.Style.Failure, "Failed to fetch object as markdown", objectExportError.message);
    }
  }, [objectExportError]);

  return (
    <Detail
      markdown={objectExport?.markdown}
      isLoading={isLoadingObjectExport}
      metadata={
        <Detail.Metadata>
          {lastModifiedDate ? (
            <Detail.Metadata.Label
              title="Last Modified Date"
              text={format(new Date(lastModifiedDate), "MMMM d, yyyy")}
            />
          ) : null}
          {lastModifiedBy ? (
            <Detail.Metadata.Label
              title="Last Modified By"
              text={lastModifiedBy.global_name || lastModifiedBy.name}
              icon={{ source: lastModifiedBy.icon, mask: Image.Mask.Circle }}
            />
          ) : null}

          <Detail.Metadata.Separator />

          {createdDate ? (
            <Detail.Metadata.Label title="Created Date" text={format(new Date(createdDate), "MMMM d, yyyy")} />
          ) : null}
          {createdBy ? (
            <Detail.Metadata.Label
              title="Created By"
              text={createdBy.global_name || createdBy.name}
              icon={{ source: createdBy.icon, mask: Image.Mask.Circle }}
            />
          ) : null}

          <Detail.Metadata.Separator />

          {tags.length > 0 ? (
            <Detail.Metadata.TagList title="Tags">
              {tags.map((tag) => (
                <Detail.Metadata.TagList.Item key={tag.id} text={tag.name} color={tag.color} />
              ))}
            </Detail.Metadata.TagList>
          ) : (
            <Detail.Metadata.Label title="Tags" text="No Tags" />
          )}
          {}
        </Detail.Metadata>
      }
      actions={
        <ObjectActions
          spaceId={spaceId}
          objectId={objectId}
          title={title}
          exportMutate={mutateObjectExport}
          objectExport={objectExport}
          viewType="object"
        />
      }
    />
  );
}
