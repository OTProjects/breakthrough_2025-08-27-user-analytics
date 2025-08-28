# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a JavaScript/TypeScript project optimized for modern web development. The project uses industry-standard tools and follows best practices for scalable application development.

## Development Commands

### Package Management
- `npm install` - Install dependencies
- `npm ci` - Install dependencies for CI/CD

### Build Commands
- `npm run build` - Build Next.js project for production
- `npm run dev` - Start Next.js development server
- `npm start` - Start Next.js production server

### Testing Commands
- `npm test` or `npm run test` - Run Playwright E2E tests
- `npm run test:ui` - Run Playwright tests with UI mode

### Code Quality Commands
- `npm run lint` - Run ESLint for code linting
- `npx prettier --write .` - Format code with Prettier
- `npx prettier --check .` - Check code formatting
- `npx tsc --noEmit` - Run TypeScript type checking

### Database Commands
- `npm run db:push` - Push Prisma schema to database
- `npm run db:generate` - Generate Prisma client
- `npm run seed` - Seed database with initial data

### Analytics Development
- `npm run simulate` - Run analytics simulation
- `npm run analyze` - Analyze collected analytics data

## Technology Stack

### Core Technologies
- **JavaScript/TypeScript** - Primary programming languages
- **Node.js** - Runtime environment
- **npm/yarn** - Package management

### Core Framework
- **Next.js 14** - React framework with App Router, SSR/SSG capabilities
- **React 18** - UI library with hooks and functional components
- **TypeScript** - Static type checking and enhanced developer experience

### Database & Analytics
- **Prisma** - Type-safe database ORM with SQLite
- **PostHog** - Product analytics and feature flags
- **Zod** - Runtime type validation

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Recharts** - Data visualization for React

### Testing Framework
- **Playwright** - Cross-browser end-to-end testing
- **@playwright/test** - Test runner and assertions

### Code Quality Tools
- **ESLint** - JavaScript/TypeScript linter
- **Prettier** - Code formatter
- **TypeScript** - Static type checking
- **Husky** - Git hooks

## Project Structure Guidelines

### File Organization
```
app/               # Next.js App Router pages and API routes
├── api/          # API route handlers
├── (pages)/      # Page components
├── globals.css   # Global styles
└── layout.tsx    # Root layout component

components/        # Reusable UI components
├── ui/           # Basic UI components
├── charts/       # Data visualization components
├── feedback/     # User feedback components
└── providers/    # React context providers

hooks/            # Custom React hooks
lib/              # Utility functions and configurations
├── analytics.ts  # Analytics utilities
├── db.ts         # Database configuration
└── posthog-*.ts  # PostHog client/server configs

prisma/           # Database schema and migrations
scripts/          # Development and maintenance scripts
tests/            # E2E test files
```

### Naming Conventions
- **Files**: Use kebab-case for file names (`user-profile.component.ts`)
- **Components**: Use PascalCase for component names (`UserProfile`)
- **Functions**: Use camelCase for function names (`getUserData`)
- **Constants**: Use UPPER_SNAKE_CASE for constants (`API_BASE_URL`)
- **Types/Interfaces**: Use PascalCase with descriptive names (`UserData`, `ApiResponse`)

## TypeScript Guidelines

### Type Safety
- Enable strict mode in `tsconfig.json`
- Use explicit types for function parameters and return values
- Prefer interfaces over types for object shapes
- Use union types for multiple possible values
- Avoid `any` type - use `unknown` when type is truly unknown

### Best Practices
- Use type guards for runtime type checking
- Leverage utility types (`Partial`, `Pick`, `Omit`, etc.)
- Create custom types for domain-specific data
- Use enums for finite sets of values
- Document complex types with JSDoc comments

## Code Quality Standards

### ESLint Configuration
- Use recommended ESLint rules for JavaScript/TypeScript
- Enable React-specific rules if using React
- Configure import/export rules for consistent module usage
- Set up accessibility rules for inclusive development

### Prettier Configuration
- Use consistent indentation (2 spaces recommended)
- Set maximum line length (80-100 characters)
- Use single quotes for strings
- Add trailing commas for better git diffs

### Testing Standards
- Aim for 80%+ test coverage
- Write unit tests for utilities and business logic
- Use integration tests for component interactions
- Implement e2e tests for critical user flows
- Follow AAA pattern (Arrange, Act, Assert)

## Performance Optimization

### Bundle Optimization
- Use code splitting for large applications
- Implement lazy loading for routes and components
- Optimize images and assets
- Use tree shaking to eliminate dead code
- Analyze bundle size regularly

### Runtime Performance
- Implement proper memoization (React.memo, useMemo, useCallback)
- Use virtualization for large lists
- Optimize re-renders in React applications
- Implement proper error boundaries
- Use web workers for heavy computations

## Security Guidelines

### Dependencies
- Regularly audit dependencies with `npm audit`
- Keep dependencies updated
- Use lock files (`package-lock.json`, `yarn.lock`)
- Avoid dependencies with known vulnerabilities

### Code Security
- Sanitize user inputs
- Use HTTPS for API calls
- Implement proper authentication and authorization
- Store sensitive data securely (environment variables)
- Use Content Security Policy (CSP) headers

## Development Workflow

### Before Starting
1. Check Node.js version compatibility
2. Install dependencies with `npm install`
3. Copy environment variables from `.env.example`
4. Run type checking with `npm run typecheck`

### During Development
1. Use TypeScript for type safety
2. Run linter frequently to catch issues early
3. Write tests for new features
4. Use meaningful commit messages
5. Review code changes before committing

### Before Committing
1. Run E2E tests: `npm test`
2. Check linting: `npm run lint`
3. Verify formatting: `npx prettier --check .`
4. Run type checking: `npx tsc --noEmit`
5. Test production build: `npm run build`
6. Push database schema: `npm run db:push` (if schema changed)
7. Test analytics events: `npm run simulate` (if analytics changed)