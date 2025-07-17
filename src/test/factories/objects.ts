import {
  Color,
  EmojiIcon,
  FileIcon,
  IconFormat,
  NamedIcon,
  ObjectIcon,
  ObjectLayout,
  PropertyFormat,
  PropertyWithValue,
  RawSpaceObject,
  RawSpaceObjectWithBody,
  RawType,
  SortProperty,
  Space,
  SpaceObject,
  Tag,
  Type,
} from "../../models";

/**
 * Creates a test ObjectIcon
 */
export function createObjectIcon(overrides: Partial<ObjectIcon> = {}): ObjectIcon {
  // Default to emoji icon
  if (!overrides.format || overrides.format === IconFormat.Emoji) {
    return {
      format: IconFormat.Emoji,
      emoji: "📄",
      ...overrides,
    } as EmojiIcon;
  } else if (overrides.format === IconFormat.File) {
    return {
      format: IconFormat.File,
      file: "file.png",
      ...overrides,
    } as FileIcon;
  } else {
    return {
      format: IconFormat.Icon,
      name: "document",
      color: Color.Blue,
      ...overrides,
    } as NamedIcon;
  }
}

/**
 * Creates a test Type object
 */
export function createType(overrides: Partial<Type> = {}): Type {
  return {
    object: "type",
    id: "type-1",
    key: "document",
    name: "Document",
    plural_name: "Documents",
    icon: "📄",
    layout: ObjectLayout.Basic,
    archived: false,
    properties: [],
    ...overrides,
  };
}

/**
 * Creates a test RawType object
 */
export function createRawType(overrides: Partial<RawType> = {}): RawType {
  return {
    object: "type",
    id: "type-1",
    key: "document",
    plural_name: "Documents",
    name: "Document",
    icon: createObjectIcon(),
    layout: ObjectLayout.Basic,
    archived: false,
    properties: [],
    ...overrides,
  };
}

/**
 * Creates a test SpaceObject
 */
export function createSpaceObject(overrides: Partial<SpaceObject> = {}): SpaceObject {
  return {
    object: "object",
    id: "obj-1",
    name: "Test Object",
    icon: "📄",
    space_id: "space-1",
    layout: ObjectLayout.Basic,
    type: createType(),
    properties: [],
    snippet: "Test snippet content",
    archived: false,
    ...overrides,
  };
}

/**
 * Creates a test Tag
 */
export function createTag(overrides: Partial<Tag> = {}): Tag {
  return {
    id: "tag-1",
    key: "tag-1",
    name: "Test Tag",
    color: Color.Blue,
    ...overrides,
  };
}

/**
 * Creates a test Property
 * @param format The property format to create
 * @param overrides Optional property overrides
 */
export function createProperty(
  format: "text" | "number" | "date" | "checkbox" | "url" | "email" | "phone" | "tags" | "select" = "text",
  overrides: Partial<PropertyWithValue> = {},
): PropertyWithValue {
  const baseProperty: PropertyWithValue = {
    id: "prop-1",
    key: "property",
    name: "Test Property",
    format: PropertyFormat.Text,
    ...overrides,
  };

  switch (format) {
    case "text":
      return {
        ...baseProperty,
        format: PropertyFormat.Text,
        text: "Test text value",
        ...overrides,
      };

    case "number":
      return {
        ...baseProperty,
        format: PropertyFormat.Number,
        number: 42,
        ...overrides,
      };

    case "date":
      return {
        ...baseProperty,
        format: PropertyFormat.Date,
        date: "2024-01-15T10:30:00Z",
        ...overrides,
      };

    case "checkbox":
      return {
        ...baseProperty,
        format: PropertyFormat.Checkbox,
        checkbox: true,
        ...overrides,
      };

    case "url":
      return {
        ...baseProperty,
        format: PropertyFormat.Url,
        url: "https://example.com",
        ...overrides,
      };

    case "email":
      return {
        ...baseProperty,
        format: PropertyFormat.Email,
        email: "test@example.com",
        ...overrides,
      };

    case "phone":
      return {
        ...baseProperty,
        format: PropertyFormat.Phone,
        phone: "+1234567890",
        ...overrides,
      };

    case "tags":
      return {
        ...baseProperty,
        format: PropertyFormat.MultiSelect,
        multi_select: [createTag()],
        ...overrides,
      };

    case "select":
      return {
        ...baseProperty,
        format: PropertyFormat.Select,
        select: createTag(),
        ...overrides,
      };

    default:
      return { ...baseProperty, ...overrides };
  }
}

/**
 * Creates a SpaceObject with common date and tag properties
 */
export function createSpaceObjectWithDates(date?: string): SpaceObject {
  return createSpaceObject({
    properties: [
      createProperty("date", {
        key: SortProperty.LastModifiedDate,
        name: "Last Modified",
        date: date || "2024-01-15T10:30:00Z",
      }),
      createProperty("tags", {
        key: "tag",
        name: "Tags",
      }),
    ],
  });
}

/**
 * Creates a test Space
 */
export function createSpace(overrides: Partial<Space> = {}): Space {
  return {
    object: "space",
    id: TEST_IDS.space,
    name: "Test Space",
    icon: "🌍",
    description: "Test space description",
    gateway_url: "https://gateway.example.com",
    network_id: "network-1",
    ...overrides,
  };
}

/**
 * Creates a test RawSpaceObject
 */
export function createRawSpaceObject(overrides: Partial<RawSpaceObject> = {}): RawSpaceObject {
  return {
    object: "object",
    id: TEST_IDS.object,
    space_id: TEST_IDS.space,
    name: "Test Raw Object",
    icon: createObjectIcon(),
    layout: ObjectLayout.Basic,
    snippet: "",
    type: createRawType(),
    archived: false,
    properties: [],
    ...overrides,
  };
}

/**
 * Creates a test RawSpaceObjectWithBody
 */
export function createRawSpaceObjectWithBody(overrides: Partial<RawSpaceObjectWithBody> = {}): RawSpaceObjectWithBody {
  return {
    ...createRawSpaceObject(),
    markdown: "# Content",
    ...overrides,
  };
}

/**
 * Test data constants
 */
/**
 * Creates a SpaceObjectWithBody for testing
 */
export function createSpaceObjectWithBody(overrides: Partial<SpaceObject> = {}) {
  return {
    ...createSpaceObject(overrides),
    markdown: "",
  };
}

export const TEST_IDS = {
  space: "space-1",
  object: "obj-1",
  type: "type-1",
  tag: "tag-1",
  property: "prop-1",
} as const;
