# Agent Coding Rules — FamilyDashboard

These rules apply to all AI agents working on this codebase. Follow them strictly.

---

## Code Formatting

This project uses **Prettier** (via ESLint) to enforce consistent formatting. Formatting errors will fail the CI lint step.

### After making any code edits, run:
```bash
npm run lint -- --fix
```
This auto-fixes all Prettier issues (indentation, trailing commas, line breaks, quotes, etc.).

### To verify everything is clean before finishing:
```bash
npm run lint        # must exit with code 0 (no errors, warnings allowed)
npx tsc --noEmit    # must exit with code 0 (no type errors)
```

**Never leave formatting errors unfixed.** If you edit a file, always run `lint --fix` on it afterward.

---
## Supabase Type Safety

### NEVER use `as any` or `@ts-ignore` on Supabase calls
If a Supabase mutation (`.insert()`, `.update()`, `.upsert()`, `.delete()`) causes a TypeScript error, the correct fix is **never** to suppress the error. Instead:

1. **Check `database.types.ts`** — every table must have `Relationships: []`. If it's missing, add it.
2. **Type the payload explicitly** using the generated types:
   ```ts
   type MyInsert = Database['public']['Tables']['my_table']['Insert'];
   const payload: MyInsert = { ... };
   await supabase.from('my_table').insert(payload); // no cast needed
   ```
3. **For embedded join queries** (`.select('*, other_table(col)')`), Supabase can't infer the join shape. Use `as unknown as YourType[]` with a comment explaining why.

### Regenerate types after schema changes
When adding or modifying a Supabase migration, regenerate types:
```bash
npm run db:types
```
Do NOT hand-edit `database.types.ts` to add new tables. Always regenerate from the source.

### `database.types.ts` structure requirement
Every table entry must have `Relationships: []` at the minimum:
```ts
my_table: {
  Row: { ... };
  Insert: { ... };
  Update: { ... };
  Relationships: [];  // ← required by postgrest-js v2+
};
```

---

## General TypeScript Rules

- **No `@ts-ignore`** — ever. Use `@ts-expect-error` only with a specific justification comment, and only when there is no proper type fix.
- **No `as any`** on return values from Supabase — if the inferred type is wrong, fix the type, not the assertion.
- **Prefer `unknown` over `any`** for intermediate casts when necessary.
- When a Supabase query selects partial columns (e.g., `select('id, name')`), the state type must match the selected shape — use `Pick<Row, 'id' | 'name'>` not the full `Row` type.

---

## Patterns to Avoid

| ❌ Wrong | ✅ Right |
|---|---|
| `(supabase.from('x') as any).insert(...)` | Type the payload; call without cast |
| `(data as MyType[])` on join results | `(data as unknown as MyType[])` with comment |
| Hand-editing `database.types.ts` | `npm run db:types` |
| `supabase.from('assets').select('id, name, domain')` when `domain` doesn't exist in schema | Only select columns that exist in the `Row` type |
