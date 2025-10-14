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

**API Layer**: Centralized in `src/utils/api.ts` with `apiFetch()` function that handles authentication, error handling, and response parsing. Each API endpoint is organized by domain (objects, spaces, members, etc.).

**Authentication**: Token-based authentication with local storage fallback. Supports both manual API keys and app-based pairing flow.

**Data Flow**: API → Hooks → Components. Custom hooks encapsulate data fetching logic and provide React Query-like patterns for caching and state management.

**Component Organization**:
- Forms for creation/updates are in `CreateForm/` and `UpdateForm/`
- List components for displaying collections
- Action components for user interactions
- Empty view components for no-data states

**AI Tools Integration**: Special tool files in `src/tools/` that interface with Raycast's AI system, allowing natural language interaction with Anytype data.

### Raycast Integration
The extension integrates with Raycast through:
- Commands defined in `package.json` that map to main component files
- AI tools for natural language interaction
- Preferences for API configuration and behavior customization
- Local authentication flow with the Anytype desktop app

### Testing Setup
- Vitest for testing with Happy DOM environment
- Mocked Raycast API in `src/test/mocks/raycast.ts`
- Coverage reporting configured
- Test files follow `.test.ts` naming convention
