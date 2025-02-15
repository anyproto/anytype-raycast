import { Detail, Icon, Image, showToast, Toast } from "@raycast/api";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import type { DetailData, Tag } from "../helpers/schemas";
import { useExport } from "../hooks/useExport";
import { useObject } from "../hooks/useObject";
import ObjectActions from "./ObjectActions";

type ObjectDetailProps = {
  spaceId: string;
  objectId: string;
  title: string;
  viewType: string;
  isGlobalSearch: boolean;
  isPinned: boolean;
};

export default function ObjectDetail({
  spaceId,
  objectId,
  title,
  viewType,
  isGlobalSearch,
  isPinned,
}: ObjectDetailProps) {
  const { object, objectError, isLoadingObject, mutateObject } = useObject(spaceId, objectId);
  const { objectExport, objectExportError, isLoadingObjectExport, mutateObjectExport } = useExport(
    spaceId,
    objectId,
    "markdown",
  );

  const [showDetails, setShowDetails] = useState(true);
  const details = object?.details || [];
  const excludedDetailIds = new Set(["added_date", "last_opened_date"]);
  const additionalDetails = details.filter((detail) => !excludedDetailIds.has(detail.id));

  const priorityOrder = ["description", "created_date", "created_by", "last_modified_date", "last_modified_by", "tag"];
  const orderedDetails = additionalDetails.sort((a, b) => {
    const aPriority = priorityOrder.indexOf(a.id);
    const bPriority = priorityOrder.indexOf(b.id);

    // If either detail is in the priority list, use that order.
    if (aPriority !== -1 || bPriority !== -1) {
      if (aPriority === -1) return 1;
      if (bPriority === -1) return -1;
      return aPriority - bPriority;
    }
    // Otherwise, sort alphabetically by the detail type.
    return a.details.type.localeCompare(b.details.type);
  });

  useEffect(() => {
    if (objectError) {
      showToast(Toast.Style.Failure, "Failed to fetch object", objectError.message);
    }
  }, [objectError]);

  useEffect(() => {
    if (objectExportError) {
      showToast(Toast.Style.Failure, "Failed to fetch object as markdown", objectExportError.message);
    }
  }, [objectExportError]);

  function renderDetailMetadata(detail: { id: string; details: DetailData }) {
    const { id, details: detailData } = detail;
    const titleText = detailData.name || id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    if (detailData.text) {
      return <Detail.Metadata.Label key={id} icon={Icon.Text} title={titleText} text={detailData.text} />;
    }
    if (detailData.number !== undefined) {
      return <Detail.Metadata.Label key={id} title={titleText} icon={Icon.Hashtag} text={String(detailData.number)} />;
    }
    if (detailData.date) {
      return (
        <Detail.Metadata.Label
          key={id}
          title={titleText}
          text={format(new Date(detailData.date), "MMMM d, yyyy")}
          icon={Icon.Calendar}
        />
      );
    }
    if (detailData.select || detailData.multi_select) {
      const tags = (detailData.select ? detailData.select : detailData.multi_select) as Tag[];
      return (
        <Detail.Metadata.TagList key={id} title={titleText}>
          {tags.map((tag) => (
            <Detail.Metadata.TagList.Item key={tag.id} text={tag.name} color={tag.color} />
          ))}
        </Detail.Metadata.TagList>
      );
    }
    if (detailData.object) {
      return (
        <Detail.Metadata.Label
          key={id}
          title={titleText}
          text={detailData.object.name || detailData.object.id}
          icon={{ source: detailData.object.icon || Icon.PersonCircle, mask: Image.Mask.Circle }}
        />
      );
    }
    return null;
  }

  function getGroup(detailId: string, detailType: string): string {
    if (detailId === "description") return "description";
    if (["created_date", "created_by", "last_modified_date", "last_modified_by"].includes(detailId))
      return "modification";
    if (detailId === "tag" || ["select", "multi_select"].includes(detailType)) return "tags";
    return "others";
  }

  const renderedDetailComponents: JSX.Element[] = [];
  let previousGroup: string | null = null;
  orderedDetails.forEach((detail) => {
    const currentGroup = getGroup(detail.id, detail.details.type);
    const rendered = renderDetailMetadata(detail);
    if (rendered) {
      if (previousGroup !== null && currentGroup !== previousGroup) {
        renderedDetailComponents.push(<Detail.Metadata.Separator key={`separator-${detail.id}`} />);
      }
      renderedDetailComponents.push(rendered);
      previousGroup = currentGroup;
    }
  });

  return (
    <Detail
      markdown={objectExport?.markdown}
      isLoading={isLoadingObject || isLoadingObjectExport}
      metadata={
        showDetails && renderedDetailComponents.length > 0 ? (
          <Detail.Metadata>{renderedDetailComponents}</Detail.Metadata>
        ) : undefined
      }
      actions={
        <ObjectActions
          spaceId={spaceId}
          objectId={objectId}
          title={title}
          mutateObject={mutateObject}
          mutateExport={mutateObjectExport}
          objectExport={objectExport}
          viewType={viewType}
          isGlobalSearch={isGlobalSearch}
          isNoPinView={false}
          isPinned={isPinned}
          showDetails={showDetails}
          onToggleDetails={() => setShowDetails((prev) => !prev)}
        />
      }
    />
  );
}
