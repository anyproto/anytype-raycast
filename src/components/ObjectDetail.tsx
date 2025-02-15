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

  function renderUniversalDetail(detail: { id: string; details: DetailData }) {
    const { id, details: detailData } = detail;
    const title = detailData.name || "Unknown";

    if (detailData.text) {
      return <Detail.Metadata.Label key={id} icon={Icon.Text} title={title} text={detailData.text} />;
    }
    if (detailData.number !== undefined) {
      return <Detail.Metadata.Label key={id} title={title} icon={Icon.Hashtag} text={String(detailData.number)} />;
    }

    if (detailData.date) {
      return (
        <Detail.Metadata.Label
          key={id}
          title={title}
          text={format(new Date(detailData.date), "MMMM d, yyyy")}
          icon={Icon.Calendar}
        />
      );
    }

    if (detailData.select || detailData.multi_select) {
      const tags = (detailData.select ? detailData.select : detailData.multi_select) as Tag[];
      return (
        <Detail.Metadata.TagList key={id} title={title}>
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
          title={title}
          text={detailData.object.name || detailData.object.id}
          icon={{ source: detailData.object.icon || Icon.PersonCircle, mask: Image.Mask.Circle }}
        />
      );
    }
    return null;
  }
  const mappedDetailComponents = additionalDetails.map(renderUniversalDetail).filter(Boolean);

  return (
    <Detail
      markdown={objectExport?.markdown}
      isLoading={isLoadingObject || isLoadingObjectExport}
      metadata={
        showDetails && mappedDetailComponents.length > 0 ? (
          <Detail.Metadata>{mappedDetailComponents}</Detail.Metadata>
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
