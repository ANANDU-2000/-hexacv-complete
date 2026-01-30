# Contributing to HexaResume

Thank you for your interest in contributing to HexaResume! This document provides guidelines and instructions for contributing to this monorepo project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or higher
- PostgreSQL 15.x or higher
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/hexaresume.git
   cd hexaresume
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Build shared packages:
   ```bash
   pnpm --filter @hexaresume/shared-types build
   pnpm --filter @hexaresume/ui-components build
   pnpm --filter @hexaresume/utils build
   ```

5. Set up environment variables:
   ```bash
   cp config/environments/.env.development.example .env
   ```

6. Start development:
   ```bash
   pnpm --filter @hexaresume/user-web dev
   ```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `staging` - Pre-production testing
- `development` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Creating a Feature Branch

```bash
git checkout development
git pull origin development
git checkout -b feature/your-feature-name
```

## Project Structure

```
BuildMyResume4/
├── apps/               # Applications
│   ├── user-web/      # User application
│   └── admin-web/     # Admin dashboard
├── services/          # Backend services
│   ├── api/           # Main API
│   └── admin-api/     # Admin API
├── packages/          # Shared packages
│   ├── shared-types/  # Types
│   ├── ui-components/ # UI components
│   └── utils/         # Utilities
├── database/          # Database files
└── docs/              # Documentation
```

### Adding New Code

**Frontend Component:**
```
apps/user-web/src/features/your-feature/
├── components/
│   └── YourComponent.tsx
├── services/
│   └── your-feature.service.ts
├── hooks/
│   └── use-your-feature.ts
└── types/
    └── your-feature.types.ts
```

**Backend Module:**
```
services/api/src/modules/your-module/
├── controllers/
│   └── your-module.controller.ts
├── services/
│   └── your-module.service.ts
├── validators/
│   └── your-module.validator.ts
└── types/
    └── your-module.types.ts
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Avoid `any` type - use `unknown` or proper types
- Use type imports: `import type { Type } from 'package'`
- Define interfaces for component props
- Use const assertions where appropriate

### React

- Use functional components with hooks
- Use proper TypeScript types for props
- Implement proper error boundaries
- Use memo for expensive computations
- Avoid prop drilling - use context when needed

### Naming Conventions

- **Files**: `kebab-case.tsx`, `kebab-case.ts`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Max line length: 100 characters
- Use trailing commas in multi-line objects/arrays

### Example

```typescript
import { useState } from 'react'
import type { ResumeData } from '@hexaresume/shared-types'

interface EditorProps {
  data: ResumeData
  onChange: (data: ResumeData) => void
}

export function Editor({ data, onChange }: EditorProps) {
  const [isValid, setIsValid] = useState(false)
  
  // Implementation
  
  return (
    <div className="editor">
      {/* JSX */}
    </div>
  )
}
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Examples

```bash
feat(user-web): add PDF upload validation

- Validate file size (max 5MB)
- Validate file type (PDF only)
- Show error messages to user

Closes #123
```

```bash
fix(api): resolve Razorpay signature verification

The signature verification was failing due to incorrect
string concatenation. Fixed by using template literals.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. **Update from development:**
   ```bash
   git checkout development
   git pull origin development
   git checkout your-branch
   git rebase development
   ```

2. **Run linters:**
   ```bash
   pnpm lint
   ```

3. **Run tests:**
   ```bash
   pnpm test
   ```

4. **Build packages:**
   ```bash
   pnpm build
   ```

### Submitting PR

1. Push your branch:
   ```bash
   git push origin feature/your-feature
   ```

2. Create Pull Request on GitHub
3. Fill out the PR template completely
4. Link related issues
5. Request review from appropriate team

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] PR title follows conventional commits

### Review Process

- PRs require at least 1 approval
- PRs to `main` require 2 approvals
- Address all review comments
- Keep PR scope focused and small
- Respond to reviews within 48 hours

## Testing

### Unit Tests

```typescript
// your-feature.test.ts
import { describe, it, expect } from 'vitest'
import { yourFunction } from './your-feature'

describe('yourFunction', () => {
  it('should return expected result', () => {
    const result = yourFunction('input')
    expect(result).toBe('expected')
  })
})
```

### Integration Tests

```typescript
// your-api.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../app'

describe('POST /api/endpoint', () => {
  it('should create resource', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'value' })
    
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
  })
})
```

### Running Tests

```bash
# All tests
pnpm test

# Specific package
pnpm --filter @hexaresume/api test

# Watch mode
pnpm --filter @hexaresume/api test --watch

# Coverage
pnpm --filter @hexaresume/api test --coverage
```

## Questions?

- Check existing documentation in `/docs`
- Search existing issues
- Ask in discussions
- Contact maintainers

Thank you for contributing to HexaResume!
