import { List, Image } from "@raycast/api";
import * as A from "./hooks/api";
import ChatSpaceListItem from "./components/ChatSpaceListItem";

export default function Command() {
  const { isLoading: isLoadingSpaces, data: spaces } = A.useGetSpaces();

  return (
    <List isLoading={isLoadingSpaces} searchBarPlaceholder="Search spaces...">
      {spaces?.map((space) => (
        <ChatSpaceListItem
          space={space}
          key={space.id}
          icon={{
            source: space.icon,
            mask: Image.Mask.RoundedRectangle,
          }}
        />
      ))}
    </List>
  );
}
