# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## Project Overview

"Emp" is a React + TypeScript + Vite application for managing empanada orders. It's a single-page application with a table-based interface for tracking empanada quantities by person and flavor.

## Development Commands

All commands should be run from the project root directory:

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build for production (runs TypeScript check then Vite build)
npm run preview          # Preview production build locally
npm run lint             # Run ESLint on the codebase

# Dependencies
npm install              # Install dependencies
npm run <script>         # Run any script defined in package.json
```

## Architecture

### Technology Stack
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 with custom theming
- **UI Components**: Custom components using Radix UI primitives
- **Icons**: Lucide React
- **State Management**: Local React state (useState)

### Project Structure
```
├── src/
│   ├── components/ui/    # Reusable UI components (Button, Card, Input, etc.)
│   ├── lib/             # Utility functions
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── public/              # Static assets
└── dist/                # Build output (generated)
```

### Key Application Features
- **Order Management**: Excel-style table for tracking empanada orders by person and flavor
- **Dark/Light Theme**: Custom theming system with toggle
- **Order Summary**: Generate and display consolidated order totals
- **Quick Selection**: Click on person names to auto-fill default selections

### UI Components
The project uses a set of custom UI components built with Radix UI primitives:
- `Button`: Styled button component with variants
- `Card`: Container component with consistent styling
- `Input`: Form input with theme support
- `Select`: Dropdown selection component
- `Table`: Table components for data display

### Theme System
Custom theming with defined color palettes for dark and light modes. Theme classes are centrally managed in the `App.tsx` `themeClasses` object.

### State Management Pattern
The application uses local React state with a custom `OrderQuantities` interface:
```typescript
interface OrderQuantities {
  [person: string]: {
    [flavor: string]: number
  }
}
```

## Development Notes

- All styling uses Tailwind CSS classes with custom theme colors
- The application is fully contained in a single `App.tsx` component
- No external API calls or backend dependencies
- Responsive design with mobile-friendly table scrolling
- Custom color scheme with cyan accent (`#6ccff6`)
- Contains Portal Servicios style header with company branding
- Uses "Redondeo" person for rounding calculations in order totals