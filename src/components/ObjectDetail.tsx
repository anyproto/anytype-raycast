import { useEffect } from "react";
import { Action, ActionPanel, Detail, showToast, Toast } from "@raycast/api";
import { format } from "date-fns";
import type { Detail as ObjectDetail, Tag } from "../utils/schemas";
import { useExport } from "../hooks/useExport";

type ObjectDetailProps = {
  spaceId: string;
  objectId: string;
  details: ObjectDetail[];
};

export default function ObjectDetail({ spaceId, objectId, details }: ObjectDetailProps) {
  const { objectExport, objectExportError, isLoadingObjectExport } = useExport(spaceId, objectId, "markdown");

  const createdDate = details[0].details.createdDate as Date;
  const lastModifiedDate = details[0].details.lastModifiedDate as Date;
  const tags = details.flatMap((detail) => detail.details.tags || []) as Tag[];

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
          {createdDate ? (
            <Detail.Metadata.Label title="Created Date" text={format(new Date(createdDate), "MMMM d, yyyy")} />
          ) : null}
          {lastModifiedDate ? (
            <Detail.Metadata.Label
              title="Last Modified Date"
              text={format(new Date(lastModifiedDate), "MMMM d, yyyy")}
            />
          ) : null}
          {tags.length > 0 ? (
            <Detail.Metadata.TagList title="Tags">
              {tags.map((tag) => (
                <Detail.Metadata.TagList.Item key={tag.id} text={tag.name} color={tag.color} />
              ))}
            </Detail.Metadata.TagList>
          ) : null}
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.OpenInBrowser
            icon={{ source: "../assets/anytype-icon.png" }}
            title="Open in Anytype"
            url={`anytype://object?objectId=${objectId}&spaceId=${spaceId}`}
          />
        </ActionPanel>
      }
    />
  );
}
