---
name: security-review
description: Use this skill when adding authentication, handling user input, working with secrets, creating API endpoints, or implementing payment/sensitive features. Provides comprehensive security checklist and patterns.
origin: ECC
---

# Security Review Skill

This skill ensures all code follows security best practices and identifies potential vulnerabilities.

## When to Activate

- Implementing authentication or authorization
- Handling user input or file uploads
- Creating new API endpoints
- Working with secrets or credentials
- Implementing payment features
- Storing or transmitting sensitive data
- Integrating third-party APIs

## Security Checklist

### 1. Secrets Management
- Never hardcode API keys, tokens, or passwords
- Store all secrets in environment variables with existence verification
- Add `.env.local` to `.gitignore`
- Store production secrets in hosting platforms (Vercel env vars)

### 2. Input Validation
- Validate all user input with Zod schemas
- Restrict file uploads by size (5MB max recommended), type, and extension
- Use whitelist validation rather than blacklist
- Avoid sensitive information in error messages

### 3. SQL Injection Prevention
- Always use parameterized queries
- Never concatenate user input into SQL strings
- Use ORM/query builders correctly
- Properly sanitize Supabase queries

### 4. Authentication & Authorization
- Store tokens in httpOnly cookies, not localStorage
- Verify authorization before sensitive operations
- Enable Row Level Security in Supabase
- Implement role-based access control
- Maintain secure session management

### 5. XSS Prevention
- Sanitize user-provided HTML with libraries like DOMPurify
- Configure Content Security Policy headers
- Avoid unvalidated dynamic content rendering
- Leverage React's built-in XSS protections

### 6. CSRF Protection
- Implement CSRF tokens for state-changing operations
- Set SameSite=Strict on all cookies
- Use double-submit cookie patterns

### 7. Rate Limiting
- Apply rate limiting to all API endpoints
- Use stricter limits for resource-intensive operations
- Implement both IP-based and user-based limits

### 8. Sensitive Data Exposure
- Redact passwords, tokens, and card details from logs
- Return generic error messages to users
- Log detailed errors server-side only
- Never expose stack traces to clients

### 9. Dependency Security
- Run `npm audit` regularly
- Keep dependencies updated
- Commit lock files to version control
- Enable automated security scanning tools

## Code Patterns

### ❌ NEVER DO
```typescript
// Hardcoded secret
const apiKey = "sk-abc123..."

// String-concatenated SQL
const query = `SELECT * FROM users WHERE id = ${userId}`

// Storing token in localStorage
localStorage.setItem('token', accessToken)

// Logging sensitive data
console.log('User data:', { password, creditCard })
```

### ✅ ALWAYS DO
```typescript
// Environment variables
const apiKey = process.env.API_KEY
if (!apiKey) throw new Error('API_KEY not configured')

// Parameterized queries (Supabase)
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)

// httpOnly cookies (Supabase SSR handles this)
// Supabase SSR auth stores tokens in httpOnly cookies automatically

// Sanitized logging
console.log('User action:', { userId, action }) // no sensitive fields
```

### Input Validation with Zod
```typescript
import { z } from 'zod'

const TransactionSchema = z.object({
  amount: z.number().positive().max(1_000_000),
  description: z.string().min(1).max(200),
  categoryId: z.string().uuid(),
})

// In API route
const result = TransactionSchema.safeParse(req.body)
if (!result.success) {
  return Response.json({ error: 'Invalid input' }, { status: 400 })
}
```

### Supabase RLS Check
```typescript
// Verify RLS is enabled and policies exist
// In migrations:
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own family transactions"
  ON transactions FOR ALL
  USING (family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = (SELECT auth.uid())
  ));
```

## Pre-Deployment Security Checklist

- [ ] No secrets hardcoded in source code
- [ ] All user inputs validated with Zod
- [ ] No SQL string concatenation
- [ ] XSS prevention in place
- [ ] CSRF protection configured
- [ ] Rate limiting on API endpoints
- [ ] Error messages don't expose internals
- [ ] Sensitive data not logged
- [ ] npm audit shows no high/critical vulnerabilities
- [ ] RLS enabled on all Supabase tables
- [ ] CORS properly configured
- [ ] HTTPS enforced (Vercel does this automatically)
- [ ] Security headers set in `next.config.ts`
- [ ] Auth tokens in httpOnly cookies (not localStorage)
- [ ] Authorization checked before every sensitive operation

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/authentication)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
