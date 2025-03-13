import { Color, Detail, getPreferenceValues, showToast, Toast, useNavigation } from "@raycast/api";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { ObjectActions } from ".";
import { useExport, useObject } from "../hooks";
import { ExportFormat, Property, Space } from "../models";

type ObjectDetailProps = {
  space: Space;
  objectId: string;
  title: string;
  viewType: string;
  isGlobalSearch: boolean;
  isPinned: boolean;
};

export function ObjectDetail({ space, objectId, title, viewType, isGlobalSearch, isPinned }: ObjectDetailProps) {
  const { push } = useNavigation();
  const { linkDisplay } = getPreferenceValues();
  const { object, objectError, isLoadingObject, mutateObject } = useObject(space.id, objectId);
  const { objectExport, objectExportError, isLoadingObjectExport, mutateObjectExport } = useExport(
    space.id,
    objectId,
    ExportFormat.Markdown,
  );

  const [showDetails, setShowDetails] = useState(true);
  const properties = object?.properties || [];
  const excludedPropertyIds = new Set(["added_date", "last_opened_date", "last_modified_date", "last_modified_by"]);
  const additionalProperties = properties.filter((property) => !excludedPropertyIds.has(property.id));

  const formatOrder: { [key: string]: number } = {
    text: 0,
    number: 1,
    select: 2,
    multi_select: 3,
    checkbox: 4,
    phone: 5,
    date: 6,
    object: 7,
    file: 8,
    email: 9,
    url: 10,
  };

  const orderedProperties = additionalProperties.sort((a, b) => {
    const aGroup = a.format;
    const bGroup = b.format;
    const aGroupOrder = formatOrder[aGroup] ?? 100;
    const bGroupOrder = formatOrder[bGroup] ?? 100;

    if (aGroupOrder !== bGroupOrder) {
      return aGroupOrder - bGroupOrder;
    }

    // For properties in the 'text' group, ensure that 'description' comes first
    if (aGroup === "text" && bGroup === "text") {
      if (a.id === "description" && b.id !== "description") return -1;
      if (b.id === "description" && a.id !== "description") return 1;
    }

    return a.name.localeCompare(b.name);
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

  function renderDetailMetadata(property: Property) {
    const titleText = property.name || property.id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    if (property.format === "text") {
      return (
        <Detail.Metadata.Label
          key={property.id}
          title={titleText}
          text={{
            value: property.text ? property.text : property.id === "description" ? "No description" : "No text",
            color: property.text ? Color.PrimaryText : Color.SecondaryText,
          }}
          icon={{
            source: property.id === "description" ? "icons/relation/description.svg" : "icons/relation/text.svg",
            tintColor: { light: "grey", dark: "grey" },
          }}
        />
      );
    }

    if (property.format === "number") {
      return (
        <Detail.Metadata.Label
          key={property.id}
          title={titleText}
          text={{
            value: property.number ? String(property.number) : "No number",
            color: property.number ? Color.PrimaryText : Color.SecondaryText,
          }}
          icon={{ source: "icons/relation/number.svg", tintColor: { light: "grey", dark: "grey" } }}
        />
      );
    }

    if (property.format === "select") {
      const tag = property.select;
      if (tag) {
        return (
          <Detail.Metadata.TagList key={property.id} title={titleText}>
            <Detail.Metadata.TagList.Item key={tag.id} text={tag.name} color={tag.color} />
          </Detail.Metadata.TagList>
        );
      } else {
        return (
          <Detail.Metadata.Label
            key={property.id}
            title={titleText}
            text={{ value: "No status", color: Color.SecondaryText }}
            icon={{ source: "icons/relation/select.svg", tintColor: { light: "grey", dark: "grey" } }}
          />
        );
      }
    }

    if (property.format === "multi_select") {
      const tags = property.multi_select;
      if (tags && tags.length > 0) {
        return (
          <Detail.Metadata.TagList key={property.id} title={titleText}>
            {tags.map((tag) => (
              <Detail.Metadata.TagList.Item key={tag.id} text={tag.name} color={tag.color} />
            ))}
          </Detail.Metadata.TagList>
        );
      } else {
        return (
          <Detail.Metadata.Label
            key={property.id}
            title={titleText}
            text={{ value: "No tags", color: Color.SecondaryText }}
            icon={{ source: "icons/relation/multiselect.svg", tintColor: { light: "grey", dark: "grey" } }}
          />
        );
      }
    }

    if (property.format === "date") {
      return (
        <Detail.Metadata.Label
          key={property.id}
          title={titleText}
          text={{
            value: property.date ? format(new Date(property.date), "MMMM d, yyyy") : "No date",
            color: property.date ? Color.PrimaryText : Color.SecondaryText,
          }}
          icon={{ source: "icons/relation/date.svg", tintColor: { light: "grey", dark: "grey" } }}
        />
      );
    }

    if (property.format === "file") {
      const files = property.file;
      if (files && files.length > 0) {
        return (
          <Detail.Metadata.TagList key={property.id} title={titleText}>
            {files.map((file) => (
              <Detail.Metadata.TagList.Item key={file.id} text={file.name} icon={file.icon} color="grey" />
            ))}
          </Detail.Metadata.TagList>
        );
      } else {
        return (
          <Detail.Metadata.Label
            key={property.id}
            title={titleText}
            text={{ value: "No files", color: Color.SecondaryText }}
            icon={{ source: "icons/relation/file.svg", tintColor: { light: "grey", dark: "grey" } }}
          />
        );
      }
    }

    if (property.format === "checkbox") {
      return (
        <Detail.Metadata.Label
          key={property.id}
          title=""
          text={titleText}
          icon={{
            source: property.checkbox ? "icons/relation/checkbox0.svg" : "icons/relation/checkbox1.svg",
          }}
        />
      );
    }

    if (property.format === "url") {
      if (property.url) {
        if (linkDisplay === "text") {
          return (
            <Detail.Metadata.Label
              key={property.id}
              title={titleText}
              text={property.url}
              icon={{ source: "icons/relation/url.svg", tintColor: { light: "grey", dark: "grey" } }}
            />
          );
        } else {
          return (
            <Detail.Metadata.Link
              key={property.id}
              title=""
              target={property.url.match(/^[a-zA-Z][a-zA-Z\d+\-.]*:/) ? property.url : `https://${property.url}`}
              text="Open link"
            />
          );
        }
      } else {
        return (
          <Detail.Metadata.Label
            key={property.id}
            title={titleText}
            text={{ value: "No URL", color: Color.SecondaryText }}
            icon={{ source: "icons/relation/url.svg", tintColor: { light: "grey", dark: "grey" } }}
          />
        );
      }
    }

    if (property.format === "email") {
      if (property.email) {
        if (linkDisplay === "text") {
          return (
            <Detail.Metadata.Label
              key={property.id}
              title={titleText}
              text={property.email}
              icon={{ source: "icons/relation/email.svg", tintColor: { light: "grey", dark: "grey" } }}
            />
          );
        } else {
          return (
            <Detail.Metadata.Link
              key={property.id}
              title=""
              target={`mailto:${property.email}`}
              text={`Mail to ${property.email}`}
            />
          );
        }
      } else {
        return (
          <Detail.Metadata.Label
            key={property.id}
            title={titleText}
            text={{ value: "No email address", color: Color.SecondaryText }}
            icon={{ source: "icons/relation/email.svg", tintColor: { light: "grey", dark: "grey" } }}
          />
        );
      }
    }

    if (property.format === "phone") {
      return (
        <Detail.Metadata.Label
          key={property.id}
          title={titleText}
          text={{
            value: property.phone ? property.phone : "No phone number",
            color: property.phone ? Color.PrimaryText : Color.SecondaryText,
          }}
          icon={{ source: "icons/relation/phone.svg", tintColor: { light: "grey", dark: "grey" } }}
        />
      );
    }

    if (property.format === "object" && Array.isArray(property.object)) {
      if (property.object.length > 0) {
        return (
          <Detail.Metadata.TagList key={property.id} title={titleText}>
            {property.object.map((objectItem, index) => {
              const handleAction = () => {
                push(
                  <ObjectDetail
                    space={space}
                    objectId={objectItem.id}
                    title={objectItem.name}
                    viewType={viewType}
                    isGlobalSearch={isGlobalSearch}
                    isPinned={isPinned}
                  />,
                );
              };

              return (
                <Detail.Metadata.TagList.Item
                  key={`${property.id}-${index}`}
                  text={objectItem.name || objectItem.id}
                  icon={objectItem.icon}
                  onAction={objectItem.layout !== "participant" ? handleAction : undefined}
                />
              );
            })}
          </Detail.Metadata.TagList>
        );
      }
    }
    return null;
  }

  const renderedDetailComponents: JSX.Element[] = [];
  let previousGroup: string | null = null;
  orderedProperties.forEach((property) => {
    const currentGroup = property.format;
    const rendered = renderDetailMetadata(property);
    if (rendered) {
      if (previousGroup !== null && currentGroup !== previousGroup) {
        renderedDetailComponents.push(<Detail.Metadata.Separator key={`separator-${property.id}`} />);
      }
      renderedDetailComponents.push(rendered);
      previousGroup = currentGroup;
    }
  });

  return (
    <Detail
      markdown={objectExport?.markdown}
      isLoading={isLoadingObject || isLoadingObjectExport}
      navigationTitle={!isGlobalSearch ? `Browse ${space.name}` : undefined}
      metadata={
        showDetails && renderedDetailComponents.length > 0 ? (
          <Detail.Metadata>{renderedDetailComponents}</Detail.Metadata>
        ) : undefined
      }
      actions={
        <ObjectActions
          space={space}
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
