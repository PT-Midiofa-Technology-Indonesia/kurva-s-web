# Frontend Security

Complete security best practices for Curva Frontend (Next.js 16).

---

## OWASP Top 10 for Frontend

### 1. Injection Attacks (XSS, SQLi)

#### Cross-Site Scripting (XSS)

```typescript
// ❌ Bad: Unsafe HTML injection
export function UserBio({ bio }: { bio: string }) {
  return <div dangerouslySetInnerHTML={{ __html: bio }} />
}

// ✅ Good: Escape HTML
export function UserBio({ bio }: { bio: string }) {
  return <div>{bio}</div>  // React escapes by default
}

// ✅ Good: Sanitize if needed (e.g., for Markdown)
import DOMPurify from 'dompurify'

export function UserBio({ bio }: { bio: string }) {
  const sanitized = DOMPurify.sanitize(bio)
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}
```

#### SQL Injection (API Layer)

```typescript
// ❌ Bad: String concatenation
const query = `SELECT * FROM users WHERE id = '${userId}'`

// ✅ Good: Parameterized queries (handled by Laravel ORM)
// API sends parameters separately, not in URL
const response = await api.get(`/v1/users/${userId}`)
```

---

### 2. Broken Authentication

#### Secure Token Storage

```typescript
// ❌ Bad: localStorage (vulnerable to XSS)
localStorage.setItem('token', token)

// ✅ Good: HttpOnly cookies (set by server)
// Server sets: Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict
// Browser sends automatically with requests
```

#### Password Requirements

```typescript
// src/domains/auth/schemas/register.schema.ts
import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Requires uppercase letter')
    .regex(/[0-9]/, 'Requires number')
    .regex(/[!@#$%^&*]/, 'Requires special character'),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
)
```

---

### 3. Sensitive Data Exposure

#### Never Log Sensitive Data

```typescript
// ❌ Bad: Logging passwords, tokens
console.log({ email, password, token })

// ✅ Good: Log only safe info
logger.info('User login attempt', {
  email,  // OK (useridentifiable)
  // DO NOT log: password, token, creditCard, ssn
})
```

#### Redact Sensitive Data in Errors

```typescript
// ❌ Bad: Full error message exposed
catch (error) {
  throw new Error(error.message)  // Might contain sensitive data
}

// ✅ Good: Generic error for user, full error for logging
catch (error) {
  logger.error('Login failed', error)
  throw new Error('Invalid email or password')  // User-safe message
}
```

---

### 4. XML External Entities (XXE) - Less relevant for Frontend

No frontend-specific concerns, but ensure API doesn't accept XML that could be exploited.

---

### 5. Broken Access Control

#### Role-Based Access Control

```typescript
// src/domains/auth/hooks/use-permissions.ts
import { useAuthStore } from '../store'

export function usePermissions() {
  const user = useAuthStore((state) => state.user)

  return {
    canCreateUser: user?.role === 'admin',
    canEditUser: user?.role === 'admin' || user?.role === 'manager',
    canDeleteUser: user?.role === 'admin',
  }
}

// Usage
export function UserActions({ userId }: { userId: string }) {
  const { canEditUser, canDeleteUser } = usePermissions()

  return (
    <>
      {canEditUser && <EditButton userId={userId} />}
      {canDeleteUser && <DeleteButton userId={userId} />}
    </>
  )
}
```

#### Verify on Backend (Don't Trust Frontend)

```typescript
// ✅ Good: Backend validates permission
// Frontend hides button, but backend still checks
const response = await api.delete(`/v1/users/${userId}`)
// If user lacks permission → 403 from backend

// ❌ Bad: Frontend-only check
if (canDelete) {
  await api.delete(`/v1/users/${userId}`)
}
// User could manipulate frontend and still call API
```

---

### 6. Security Misconfiguration

#### Content Security Policy (CSP)

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.example.com; style-src 'self' 'unsafe-inline'",
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

### 7. Cross-Site Scripting (XSS) - See #1

---

### 8. Insecure Deserialization

```typescript
// ❌ Bad: Eval or Function constructor
const data = eval(untrustedInput)
const fn = new Function(untrustedInput)

// ✅ Good: Parse with schema
const parsed = JSON.parse(untrustedInput)
const validated = userSchema.parse(parsed)
```

---

### 9. Using Components with Known Vulnerabilities

```bash
# Check for vulnerabilities
pnpm audit

# Update vulnerable packages
pnpm update

# Audit only
pnpm audit --audit-level=moderate
```

### Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    allow:
      - dependency-type: "all"
    open-pull-requests-limit: 5
```

---

### 10. Insufficient Logging & Monitoring - See Error Handling doc

---

## Input Validation

### Frontend Validation (UX, not security)

```typescript
// src/domains/user/schemas/index.ts
import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email required'),
  
  password: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Requires uppercase')
    .regex(/[0-9]/, 'Requires number'),
  
  name: z.string()
    .min(2, 'Minimum 2 characters')
    .max(100, 'Maximum 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Only letters, spaces, hyphens, apostrophes'),
})

// Usage in form
export function CreateUserForm() {
  const form = useForm({
    resolver: zodResolver(createUserSchema),
  })

  return (
    // Form inputs with validation
  )
}
```

**Important**: Frontend validation is for UX only. Always validate on backend before storing data.

---

## CORS & CSRF Protection

### CORS Configuration

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_API_URL,
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, PATCH',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
    ]
  },
}
```

### CSRF Tokens

```typescript
// Laravel automatically handles CSRF tokens
// Frontend sends with requests via axios interceptor

// src/shared/lib/axios.ts
import api from 'axios'

const instance = api.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

// Interceptor adds CSRF token
instance.interceptors.request.use((config) => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
  if (token) {
    config.headers['X-CSRF-Token'] = token
  }
  return config
})

export default instance
```

---

## Authentication Best Practices

### JWT Storage

```typescript
// ✅ Good: Use HttpOnly cookies (set by server)
// Server: Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict

// Frontend automatically sends with requests
// Access stored token via hook for UI:
export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Token stored in HttpOnly cookie, not accessible to JS
    // But can read from server response or dedicated endpoint
    fetchToken()
  }, [])

  return token
}
```

### Logout

```typescript
export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.post('/v1/auth/logout')
    },
    onSuccess: () => {
      // Clear client cache
      queryClient.clear()

      // Redirect to login
      router.push('/login')

      // Server clears HttpOnly cookie automatically
    },
  })
}
```

---

## Dependency Security

### Regular Audits

```bash
# Check for vulnerabilities
pnpm audit

# Update to latest safe version
pnpm update

# Specific package
pnpm audit fix lodash
```

### Avoid Risky Packages

| ❌ Bad | ✅ Good | Reason |
|---|---|---|
| eval() | JSON.parse + Zod | eval executes arbitrary code |
| innerHTML | textContent or React default escaping | innerHTML allows XSS |
| window.location = url | next/link or router.push() | Prevent open redirect |
| pickle | JSON | Pickle can execute code |

---

## Environment Variables

```typescript
// .env.example
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SENTRY_DSN=https://...

// .env.local (NOT in git)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/project
```

**Rules**:
- Prefix public vars with `NEXT_PUBLIC_`
- Never commit `.env.local`
- Add `.env.local` to `.gitignore`
- Prefix secrets with `SECRET_` or no prefix (not in browser)

---

## Security Checklist

- [ ] React escapes HTML by default (don't use dangerouslySetInnerHTML)
- [ ] All user input validated with Zod (client-side UX)
- [ ] Backend validates all input (server-side security)
- [ ] No sensitive data in logs (passwords, tokens, SSN)
- [ ] HTTPS enabled (production only)
- [ ] CORS properly configured
- [ ] CSRF tokens sent with requests
- [ ] Authentication uses HttpOnly cookies
- [ ] No direct axios calls in components (use hooks)
- [ ] Sentry/error tracking configured
- [ ] Dependencies audited regularly (`pnpm audit`)
- [ ] CSP headers configured
- [ ] X-Frame-Options set (prevent clickjacking)
- [ ] No eval() or Function constructor
- [ ] Environment variables properly named
- [ ] Rate limiting on API (backend)

---

## See Also

- [Error Handling & Observability](02-error-handling.md) — Handle security errors properly
- [CLAUDE.md](../CLAUDE.md) — Architecture & conventions
