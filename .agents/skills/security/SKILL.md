---
name: security
description: Frontend security - OWASP Top 10, XSS prevention, authentication, data protection, CORS/CSRF, dependency auditing
user-invocable: false
---

# Frontend Security

OWASP Top 10 security best practices for Next.js frontend.

## OWASP Top 10

See [../../.docs/practices/04-security.md](../../.docs/practices/04-security.md) for complete coverage:

### 1. Injection (XSS, SQLi)

**XSS Prevention**:
```typescript
// ✅ Good: React escapes by default
<div>{bio}</div>

// ✅ Good: Sanitize if needed (Markdown)
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(bio) }} />

// ❌ Bad: Unsafe HTML injection
<div dangerouslySetInnerHTML={{ __html: bio }} />
```

**SQLi Prevention**:
- Use parameterized queries via API
- Never concatenate user input into queries
- Backend validates all parameters

### 2. Broken Authentication

**Token Storage**:
```typescript
// ✅ Good: HttpOnly cookies (server sets)
// Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict

// ❌ Bad: localStorage (vulnerable to XSS)
localStorage.setItem('token', token)
```

**Password Requirements**:
- Minimum 8 characters
- Uppercase letter
- Number
- Special character (!@#$%^&*)

### 3. Sensitive Data Exposure

**Never Log**:
- Passwords
- Tokens
- Credit card numbers
- SSN
- Personal data

**Redact in Errors**:
```typescript
try {
  await login(email, password)
} catch (error) {
  logger.error('Login failed', error)
  throw new Error('Invalid email or password')  // User-safe
}
```

### 4. Broken Access Control

**Frontend Check** (UX only):
```typescript
const { canEdit, canDelete } = usePermissions()
{canEdit && <EditButton />}
{canDelete && <DeleteButton />}
```

**Backend Check** (security):
```typescript
// Even if user manipulates frontend, backend validates
const response = await api.delete(`/v1/users/${userId}`)
// Returns 403 if no permission
```

### 5. Security Misconfiguration

**Content Security Policy**:
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' https://cdn.example.com"
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' }
]
```

### 6-10. Other Top 10 Items

- **Deserialization**: Parse with JSON + Zod validation
- **Vulnerable Components**: `pnpm audit` weekly
- **Insufficient Logging**: Sentry + structured logging
- **CORS/CSRF**: Configure headers, send CSRF tokens

## Key Security Areas

### Input Validation

```typescript
// Client-side (UX - not security)
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

// Server-side (actual security)
// Backend validates before storing
```

**Remember**: Frontend validation is UX only. **Always validate on backend.**

### Environment Variables

```
# Good names
NEXT_PUBLIC_API_URL=...       # Public (prefix NEXT_PUBLIC_)
SECRET_API_KEY=...            # Secret (no prefix)

# Never commit .env.local
# Add to .gitignore
```

### Dependency Security

```bash
pnpm audit              # Check for vulnerabilities
pnpm audit --fix        # Auto-fix vulnerable packages
pnpm update             # Update to latest safe versions
```

### CORS & CSRF

**CORS Configuration**:
```typescript
// next.config.js headers section
{
  key: 'Access-Control-Allow-Origin',
  value: process.env.NEXT_PUBLIC_API_URL
}
```

**CSRF Tokens**:
```typescript
// Auto-sent via axios interceptor
instance.interceptors.request.use(config => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
  if (token) config.headers['X-CSRF-Token'] = token
  return config
})
```

### Logout

```typescript
export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await api.post('/v1/auth/logout')
    },
    onSuccess: () => {
      queryClient.clear()           // Clear client cache
      router.push('/login')         // Redirect
      // Server clears HttpOnly cookie automatically
    }
  })
}
```

## Security Checklist

- [ ] React escapes HTML by default (no dangerouslySetInnerHTML)
- [ ] Input validated with Zod (client UX + server security)
- [ ] Backend validates all requests
- [ ] No sensitive data in logs
- [ ] HTTPS enabled (production only)
- [ ] CORS properly configured
- [ ] CSRF tokens sent with requests
- [ ] Authentication uses HttpOnly cookies
- [ ] No eval() or Function constructor
- [ ] Sentry configured for monitoring
- [ ] Dependencies audited regularly
- [ ] CSP headers configured
- [ ] X-Frame-Options set (prevent clickjacking)

## See Also

- [Error Handling & Observability](../../.docs/practices/02-error-handling.md) — Handle security errors properly
- [Performance](../../.docs/practices/03-performance.md) — Optimize securely
- [API Contract](../../.docs/practices/05-api-contract.md) — Secure API integration
