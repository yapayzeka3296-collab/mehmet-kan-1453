# CI TypeScript Fix Notes

This file documents the CI cleanup pass. No page layout, CSS, routes, Supabase migrations/RLS, or certificate artwork is changed by this note.

Target: resolve the TypeScript errors reported by CI #216 one by one, preserving existing UI and behavior.

Validation sequence:
1. TypeScript check
2. Lint
3. Production build
4. GitHub Actions CI
