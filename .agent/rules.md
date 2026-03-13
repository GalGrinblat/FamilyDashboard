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

## Zod Schema Validation

Zod schemas must match **exactly what the query selects**, not the full table row.

### Rule: match the schema to the select shape

If you query partial columns, use `.pick()` or an inline schema — never validate partial results with the full `*` schema:

```ts
// ❌ Wrong: query selects 2 fields but schema expects ALL fields incl. currency, type, etc.
supabase.from('accounts').select('id, name')
z.array(AccountSchema).parse(data)  // ← crashes at runtime with ZodError

// ✅ Right: pick only what was selected
supabase.from('accounts').select('id, name')
z.array(AccountSchema.pick({ id: true, name: true })).parse(data)

// ✅ Also right: select * to match the full schema
supabase.from('accounts').select('*')
z.array(AccountSchema).parse(data)
```

This is a **runtime crash** (not caught by TypeScript) because Supabase returns rows where the unselected fields are simply absent (not null).

---

## Patterns to Avoid

| ❌ Wrong | ✅ Right |
|---|---|
| `(supabase.from('x') as any).insert(...)` | Type the payload; call without cast |
| `(data as MyType[])` on join results | `(data as unknown as MyType[])` with comment |
| Hand-editing `database.types.ts` | `npm run db:types` |
| `supabase.from('assets').select('id, name, domain')` when `domain` doesn't exist | Only select columns that exist in the `Row` type |
| `z.array(FullSchema).parse(partialSelectResult)` | `z.array(FullSchema.pick({ col: true })).parse(data)` |
