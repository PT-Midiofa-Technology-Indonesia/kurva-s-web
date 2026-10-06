# Curva - Frontend Application

Modern Next.js frontend using **Domain Driven Design**, **Atomic Design Pattern**, and **SOLID Principles**.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **HTTP Client**: Axios
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Validation**: Zod

## Documentation

📍 **Start here** → **[CLAUDE.md](CLAUDE.md)** contains all quick links:
- Architecture (DDD, Atomic Design, SOLID)
- Pattern guides (API, Forms, Lists, Query Params, Error Handling)
- Directory structure
- Conventions

🏗️ **Deep dive** → **[.docs/ARCHITECTURE.md](.docs/ARCHITECTURE.md)** covers:
- Complete architecture principles
- SOLID Principles detailed
- Clean Architecture layers
- Dependency graph
- Code review checklist

⚡ **Patterns** → **[.docs/QUICK_REFERENCE.md](.docs/QUICK_REFERENCE.md)** decision tree
- "I'm building X..." → which pattern?
- Common tasks
- File organization reference

## Setup

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

## Troubleshooting

### TypeScript Errors

Run type checking:
```bash
npm run type-check
```

### Hot Reload Not Working

Clear Next.js cache:
```bash
rm -rf .next
npm run dev
```

### CORS Issues

Ensure `NEXT_PUBLIC_API_URL` points to the correct backend URL.

## Contributing

1. Follow the folder structure and naming conventions
2. Use TypeScript for type safety
3. Write components following Atomic Design
4. Keep business logic in domain services
5. Run type checking before committing

## License

Proprietary - Mediatech Indo
