# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm test` - Run all tests with Vitest
- `npm run test:puppeteer` - Run end-to-end Puppeteer tests

### Running Single Tests
```bash
# Run specific test file
npx vitest src/domain/task/Task.test.ts

# Run tests in watch mode
npx vitest --watch

# Run tests matching pattern
npx vitest --grep "TaskApplicationService"
```

### Database Commands
- Environment switching: Set `USE_IN_MEMORY_DB=true` for in-memory database (tests)
- PostgreSQL: Uses docker-compose with postgres:16-alpine
- Database initialization: `./scripts/init.sql` runs automatically on container startup

## Architecture Overview

### Clean Architecture (DDD + Ports & Adapters)
```
src/
├── application/     # Application layer (use cases, DTOs)
│   ├── dto/        # Data transfer objects
│   ├── ports/      # Input/output port interfaces
│   └── services/   # Application services
├── domain/         # Domain layer (entities, value objects)
│   ├── task/       # Task aggregate
│   ├── taskList/   # TaskList aggregate
│   └── shared/     # Shared domain types
├── infrastructure/ # Infrastructure layer (adapters)
│   ├── adapters/   # Repository implementations
│   └── config/     # Dependency injection & DB config
└── shared/types/   # Unified type definitions
```

### Key Architectural Patterns
- **Dependency Injection**: `DependencyContainer` manages all dependencies with environment-based repository selection
- **Repository Pattern**: Dual implementation (InMemory for tests, PostgreSQL for production)
- **Port & Adapter**: Clean boundaries between layers
- **Aggregate Design**: Task and TaskList as independent aggregates with ID-based references

### Database Strategy
- **Production**: PostgreSQL with `pg` (node-postgres) client
- **Tests**: In-memory repositories for speed (143 tests, 100% pass rate)
- **Environment Selection**: `USE_IN_MEMORY_DB=true` switches to in-memory mode
- **Connection**: Uses connection pooling via `createDatabasePool()`

## UI Architecture

### Next.js App Router Structure
```
app/
├── dashboard/      # Main application page
├── page.tsx       # Root page (redirects to /dashboard)
├── layout.tsx     # Root layout with theme provider
└── globals.css    # Design tokens and CSS variables
```

### Component Organization
```
components/
├── server/        # Server Components (semantic HTML)
│   ├── DashboardHeader.tsx    # <header>
│   ├── TaskListSidebar.tsx    # <aside>
│   ├── TaskList.tsx           # <section>
│   └── TaskItem.tsx           # <li>
├── client/        # Client Components (interactive)
│   ├── TaskFormModal.tsx
│   ├── TaskEditModal.tsx
│   └── TaskMoveSelect.tsx
└── ui/           # Base UI components (shadcn/ui style)
```

### Design System
- **Theme**: next-themes with system/light/dark modes
- **Styling**: Tailwind CSS with custom design tokens
- **Typography**: Geist Sans/Mono fonts with semantic scale (.text-display, .text-heading, etc.)
- **Semantic HTML**: Strong emphasis on `<header>`, `<aside>`, `<section>`, `<ul>/<li>` structure
- **Design Philosophy**: Modern minimal design with functional beauty

## Domain Model

### Core Entities
- **Task**: Main task entity with Title, Description, DueDate, Status value objects
- **TaskList**: Task grouping entity with ListName value object

### Value Objects (All with validation)
- `Title.vo.ts` / `ListName.vo.ts` - Name validation (non-empty, length limits)
- `Description.vo.ts` - Optional description with length limits  
- `DueDate.vo.ts` - Date validation (no past dates)
- `Status.vo.ts` - Task status (未着手/進行中/完了)

### Unified Type System
- **Central Definition**: `src/shared/types/TaskStatus.ts` eliminates 87.5% of type duplication
- **Brand Types**: Strong typing via `src/domain/shared/types.ts` (TaskId, ListId, etc.)
- **Type Conversion**: `TaskStatusConverter` for safe type transformations

## Testing Strategy

### Test Framework: Vitest
- **Configuration**: `vitest.config.ts` with jsdom environment
- **Test Coverage**: 143 tests with 100% pass rate
- **Test Types**: Unit tests for all domain objects, integration tests for application services
- **Time Mocking**: Uses `TimeProvider` injection for deterministic time-dependent tests
- **Repository Mocking**: In-memory implementations for fast, isolated testing

### Test Patterns
```typescript
// Example test setup pattern
beforeEach(async () => {
  taskRepository = new InMemoryTaskRepository();
  mockTimeProvider = { now: () => new Date('2024-06-02T10:00:00.000Z') };
  service = new TaskApplicationService(taskRepository, taskListRepository, mockTimeProvider);
});
```

## Important Implementation Notes

### Server Actions Integration
- Server Actions are implemented in `app/actions/` but require UI integration
- Use existing `createDependencyContainer()` for service access
- Follow established DTO patterns for data transfer

### Environment Variables
- `USE_IN_MEMORY_DB=true` - Forces in-memory database (required for tests)
- Database connection vars: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`

### Code Quality Standards
- **Type Safety**: Extensive use of branded types and value objects
- **Error Handling**: Custom `ApplicationError` hierarchy with specific error types
- **Validation**: All domain objects self-validate on construction
- **Immutability**: Value objects are immutable by design

### Development Container
- Uses Docker Compose with VSCode dev containers
- PostgreSQL database auto-initializes with `scripts/init.sql`
- Puppeteer configured for E2E testing with Chrome in container

## Common Patterns to Follow

### Creating New Features
1. Start with domain modeling (entities/value objects)
2. Define repository interfaces in `application/ports/output/`
3. Implement application services with proper DTO mapping
4. Add both in-memory and PostgreSQL repository implementations
5. Write comprehensive tests covering all scenarios
6. Integrate via dependency injection in `DependencyContainer`

### UI Development
- Use semantic HTML elements over generic divs
- Follow the established design token system in `globals.css`
- Prefer Server Components for static content, Client Components for interactivity
- Maintain the modern minimal aesthetic (avoid unnecessary decorative elements)