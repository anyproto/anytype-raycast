# Test Utilities Documentation

This directory contains shared test utilities, factories, and helpers to make writing tests easier and more consistent.

## Directory Structure

```
src/test/
├── factories/     # Object creation utilities
│   ├── objects.ts # SpaceObject, Type, Tag, Property factories
│   └── api.ts     # API response factories
├── helpers/       # Test helper functions
│   └── mock-handlers.ts # useCachedPromise mock utilities
├── mocks/         # Global mocks (from vitest config)
└── setup.ts       # Test environment setup
```

## Usage Examples

### 1. Creating Mock Objects

```typescript
import { createSpaceObject, createType, TEST_IDS } from "../../test";

// Create a basic space object
const mockObject = createSpaceObject({
  id: TEST_IDS.object,
  name: "My Test Object",
});

// Create with properties
const objectWithDates = createSpaceObjectWithDates("2024-01-15T10:30:00Z");
```

### 2. Mocking useCachedPromise

```typescript
import { mockCachedPromiseSuccess, mockCachedPromiseLoading, mockCachedPromiseError } from "../../test";

// Success state
vi.mocked(useCachedPromise).mockReturnValue(mockCachedPromiseSuccess(data) as any);

// Loading state
vi.mocked(useCachedPromise).mockReturnValue(mockCachedPromiseLoading() as any);

// Error state
vi.mocked(useCachedPromise).mockReturnValue(mockCachedPromiseError("Something went wrong") as any);
```

### 3. Creating API Responses

```typescript
import { createApiResponse, createPaginatedResponse } from "../../test";

// Simple API response
const response = createApiResponse(payload, {
  "Anytype-Version": "1.0.0",
});

// Paginated response
const paginatedResponse = createPaginatedResponse(items, {
  total: 100,
  offset: 20,
  limit: 20,
  hasMore: true,
});
```

## Common Test Patterns

### Testing Hooks

```typescript
describe("useMyHook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle success case", () => {
    const mockData = createSpaceObject();
    vi.mocked(useCachedPromise).mockReturnValue(mockCachedPromiseSuccess(mockData) as any);

    const { result } = renderHook(() => useMyHook());

    expect(result.current.data).toEqual(mockData);
  });
});
```

### Testing API Functions

```typescript
describe("getObject", () => {
  it("should fetch object successfully", async () => {
    const mockResponse = createApiResponse({ object: createRawSpaceObject() }, { "Anytype-Version": "1.0.0" });

    vi.mocked(apiFetch).mockResolvedValue(mockResponse);

    const result = await getObject(TEST_IDS.space, TEST_IDS.object);
    expect(result).toBeDefined();
  });
});
```

## Best Practices

1. **Use Factory Functions**: Always use factory functions instead of manually creating objects
2. **Import from Central Location**: Import all test utilities from `"../../test"`
3. **Clear Mocks**: Always call `vi.clearAllMocks()` in `beforeEach`
4. **Type Safety**: Use `as any` sparingly and only for mock type conversions
5. **Consistent IDs**: Use `TEST_IDS` constants for consistent test data

## Benefits

- **Reduced Duplication**: ~40-50% less boilerplate code
- **Better Type Safety**: Factories ensure correct object structures
- **Easier Maintenance**: Update mocks in one place
- **Faster Test Writing**: Import and use pre-built utilities
- **Consistency**: All tests follow the same patterns
