---
name: verification-loop
description: A comprehensive verification system for Claude Code sessions. Run before every PR or significant commit. Checks build, types, lint, tests, security, and diff quality.
origin: ECC
---

# Verification Loop

A systematic quality assurance process for code changes. Run this before every pull request or significant commit.

## Six-Phase Verification

### Phase 1: Build Verification (CRITICAL — stop if fails)

```bash
npm run build
```

If build fails, stop. Fix errors before proceeding.

### Phase 2: Type Checking

```bash
npx tsc --noEmit --pretty
```

Zero TypeScript errors required. No `any` types. No implicit `any`.

### Phase 3: Linting

```bash
npm run lint
```

All ESLint rules must pass. Auto-fix where possible:
```bash
npx eslint . --fix
```

### Phase 4: Tests (if configured)

```bash
npm test -- --coverage
```

- Minimum 80% code coverage
- All tests green
- No skipped tests without justification

*If no test infrastructure yet: note coverage gap and plan to add tests.*

### Phase 5: Security Scan

```bash
npm audit --audit-level=high
```

Check for:
- Hardcoded secrets (`grep -r "process.env" --include="*.ts"` to verify all secrets use env vars)
- `console.log` statements with sensitive data
- Debug code left in

### Phase 6: Diff Review

```bash
git diff --staged
```

Review every changed line:
- Does each change serve the stated purpose?
- No unrelated changes mixed in?
- No accidentally staged files?
- No commented-out code?
- No TODO/FIXME without ticket references?

## Quality Metrics

| Metric | Target |
|--------|--------|
| Build | ✅ Passes |
| TypeScript errors | 0 |
| ESLint errors | 0 |
| Test coverage | ≥ 80% |
| npm audit HIGH | 0 |
| Hardcoded secrets | 0 |

## Verification Checkpoints

Run verification at these moments:
- After completing each feature or bug fix
- Before creating a pull request
- After resolving merge conflicts
- Every ~15 minutes during extended sessions

## Output Format

```
## Verification Report — [date]

### Phase 1: Build       ✅ PASS / ❌ FAIL
### Phase 2: Types       ✅ PASS / ❌ FAIL — X errors
### Phase 3: Lint        ✅ PASS / ❌ FAIL — X warnings
### Phase 4: Tests       ✅ PASS / ⚠️ SKIP (no tests yet) — X% coverage
### Phase 5: Security    ✅ PASS / ❌ FAIL
### Phase 6: Diff        ✅ CLEAN / ⚠️ REVIEW NEEDED

## Status: READY FOR PR / BLOCKERS FOUND

## Blockers (if any):
- [Phase] [description] [file:line]
```

## Common Blockers and Fixes

| Blocker | Fix |
|---------|-----|
| Build fails | Run `npx tsc --noEmit --pretty` for details |
| Type error `any` | Add explicit type annotation |
| `Object possibly undefined` | Add optional chaining `?.` or null check |
| ESLint rule violation | Check rule, fix or add comment if intentional |
| npm audit HIGH | `npm audit fix` or pin to safe version |
| Staged unrelated file | `git restore --staged <file>` |

## Remember

"Hooks catch issues immediately; this skill provides comprehensive review." Run the full loop before every PR — catching issues before review is faster than fixing them after.
