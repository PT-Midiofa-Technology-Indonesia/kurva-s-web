# API - Shared API Functions

Cross-domain API functions for common backend endpoints.

## Available APIs

### enumApi

Fetch enum values from backend.

```typescript
import { enumApi } from '@/shared/api/get-enums';

const response = await enumApi.get('roles');
// Returns: { success: true, data: [{ id: '1', name: 'Admin' }, ...] }
```

**Endpoints:**
- `roles` — Role enum
- `status` — Status enum
- `project-types` — Project type enum
- `priorities` — Priority enum

---

### geographyApi

Fetch geographic data (provinces, cities, districts, villages).

```typescript
import { geographyApi } from '@/shared/api/get-geography';

const provinces = await geographyApi.getProvinces();
const cities = await geographyApi.getCities(provinceId);
const districts = await geographyApi.getDistricts(cityId);
const villages = await geographyApi.getVillages(districtId);
```

---

## Usage in Domains

```typescript
// In domain hooks
import { enumApi } from '@/shared/api/get-enums';

export function useRoleOptions() {
  return useQuery({
    queryKey: ['enums', 'roles'],
    queryFn: () => enumApi.get('roles'),
  });
}
```

---

## Adding New API Functions

Add cross-domain API functions here when used by 2+ domains.

For domain-specific APIs, use `@/domains/<domain>/api/` instead.