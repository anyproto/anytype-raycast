import { List, Image } from "@raycast/api";
import { useSpaces } from "./hooks/useSpaces";
import ChatSpaceListItem from "./components/ChatSpaceListItem";

export default function Command() {
  const { spaces, isLoadingSpaces } = useSpaces();

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
