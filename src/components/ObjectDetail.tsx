import { Detail } from "@raycast/api";
import { format } from "date-fns";
import type { Detail as ObjectDetail, Block, Tag } from "../utils/schemas";

type ObjectDetailProps = {
  title: string;
  details: ObjectDetail[];
  blocks: Block[];
};

export default function ObjectDetail({ title, details, blocks }: ObjectDetailProps) {
  const styleMap: { [key: string]: string } = {
    Paragraph: "",
    Header1: "#",
    Header2: "##",
    Header3: "###",
    Header4: "####",
    Quote: ">",
    Code: "```",
    Title: "#",
    Checkbox: "- [ ]",
    Marked: "*",
    Numbered: "1.",
    // TODO: toggle
    Toggle: "",
    Description: "_",
    Callout: ">",
  };

  const renderBlocks =
    `# ${title}\n\n` +
    blocks[0]?.children_ids
      .map((childId) => blocks.find((block) => block.id === childId))
      .filter((block) => block !== undefined)
      .map((block) => {
        if (block && block.text) {
          const stylePrefix = styleMap[block.text.style] || "";
          let content = `${stylePrefix} ${block.text.text}`;
          if (block.text.style === "Code" || block.text.style === "Toggle") {
            content += stylePrefix;
          }
          return content;
        }
        return "";
      })
      .join("\n");

  const createdDate = details[0].details.createdDate as Date;
  const lastModifiedDate = details[0].details.lastModifiedDate as Date;
  const tags = details.flatMap((detail) => detail.details.tags || []) as Tag[];

  return (
    <Detail
      markdown={renderBlocks}
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
    />
  );
}
