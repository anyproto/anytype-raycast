# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Anytype Raycast extension codebase.

## Essential Commands

### Development

- `npm run dev` - Start Raycast development mode
- `npm run build` - Build the extension
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run typecheck` - Run TypeScript type checking

### Testing

- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage report
- `npx vitest run <file-pattern>` - Run specific test files

## Project Overview

Raycast extension for Anytype that enables interaction with Anytype's local API. Built with TypeScript/React using Raycast's extension framework.

### Directory Structure

```
src/
├── api/           # API layer by domain (auth, objects, spaces, etc.)
├── components/    # UI components (Forms, Actions, Lists, EmptyView)
├── hooks/         # Custom React hooks for data fetching
├── mappers/       # Data transformations between API and UI
├── models/        # TypeScript interfaces and types
├── utils/         # Utilities (api.ts, constants, helpers)
├── tools/         # AI-enabled tools for Raycast AI
├── test/          # Test utilities and mocks
└── __tests__/     # Test files for commands
```

### Key Patterns

**API Layer**: All requests go through `apiFetch()` in `src/utils/api.ts`:

```typescript
const { url, method } = apiEndpoints.getObject(spaceId, objectId);
const response = await apiFetch<ResponseType>(url, { method });
```

**Data Flow**: API → Hooks → Components

- API functions return raw data
- Hooks manage caching and state with `useCachedPromise`
- Components handle UI and user interaction

**Authentication**:

- Local pairing with Anytype desktop (default)
- Manual API key (for headless instances)
- Token stored in LocalStorage with `EnsureAuthenticated` wrapper

**Error Handling**:

```typescript
try {
  const result = await apiFetch("/endpoint");
} catch (error) {
  showToast({
    style: Toast.Style.Failure,
    title: error instanceof ApiError ? "API Error" : "Unexpected Error",
    message: error.message,
  });
}
```

## Code Guidelines

### TypeScript

- Strict mode enabled - no implicit any
- Define explicit return types for functions
- Use interfaces for object shapes
- Leverage discriminated unions for state

### Components

- Single responsibility principle
- Extract logic into custom hooks
- Follow Raycast UI patterns
- Implement proper error boundaries

### Testing

- Test all new functionality
- Mock external dependencies
- Use descriptive test names
- Test error cases and edge conditions

## Common Workflows

### Adding a New Command

1. Define in `package.json` with metadata
2. Create main component file in `src/`
3. Implement hooks in `src/hooks/`
4. Add API endpoints in `src/api/`
5. Create tests and update types

### Creating Forms

1. Component in `src/components/Forms/`
2. Define Zod schema for validation
3. Use Raycast Form components
4. Add success/failure toasts
5. Test validation scenarios

### Implementing API Endpoints

1. Add to appropriate file in `src/api/`
2. Define types in `src/models/`
3. Create hook in `src/hooks/`
4. Handle errors and loading states

## Important Notes

### Performance

- Use pagination (configurable limits: 50, 100, 200)
- Implement caching with `useCachedPromise`
- Debounce search inputs
- Lazy load when appropriate

### Conventions

- Commands: kebab-case (create-object.tsx)
- Components: PascalCase (CreateForm.tsx)
- Utilities: camelCase (api.ts)
- Tests: .test.ts suffix

### Unique Features

- **AI Tools**: 12 tools for natural language interaction
- **Icon System**: 200+ icons with dynamic resolution
- **Draft System**: Auto-save unsaved form changes
- **Quicklinks**: Pre-filled forms for rapid creation
- **Deeplinks**: Direct integration with Anytype desktop

### API Configuration

- Default URL: `http://127.0.0.1:31009`
- API version: `2025-05-20`
- Configurable through Raycast preferences

### Debugging Tips

- Use `console.log` with `npm run dev`
- Check Network tab for API requests
- Common issues:
  - Auth failures: Check API key/connection
  - Empty lists: Verify space selection
  - Form errors: Check validation schemas
