# React Patterns Reference

## API Type Extraction

```typescript
import type { paths } from "@/types/api";

type OrganizationsResponse =
  paths["/api/v1/organizations/"]["get"]["responses"]["200"]["content"]["application/json"];

export type Organization = NonNullable<
  NonNullable<OrganizationsResponse["data"]>["organizations"]
>[number];
```

## Query Hook

Place in `src/services/[domain].ts`:

```typescript
export function useLocations(filters?: LocationSearchDTO) {
  return useQuery({
    queryKey: ["locations", filters],
    queryFn: async () => {
      const response = await apiClient.get<GetLocationsResponse>(
        "/api/v1/locations/",
        { params: filters }
      );
      return response.data;
    },
  });
}
```

## Mutation Hook

ALWAYS invalidate queries and show toast:

```typescript
export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLocationRequest) => {
      const response = await apiClient.post("/api/v1/locations/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Location created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || "Failed to create location");
    },
  });
}
```

## Page Component

```tsx
// src/routes/App/FeaturePage/index.tsx
export function FeaturePage() {
  const { data, isLoading, isError, error } = useFeatureList();

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (isError) return <ErrorAlert message={error.message} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feature Title</h1>
        <p className="text-muted-foreground">Description</p>
      </div>
    </div>
  );
}
```

## Route Authorization

```tsx
<Route
  path="organizations"
  element={
    <Authorize policy={{ roles: [ROLES.SUPER_ADMIN] }} fallback={<Navigate to="/" />}>
      <OrganizationsPage />
    </Authorize>
  }
/>
```

## Zustand Store (UI State Only)

Define selectors OUTSIDE components for stability:

```typescript
const authSelector = (state: StoreState) => state.auth.authToken;

function MyComponent() {
  const authToken = useStore(authSelector);
  const { isExpanded, setIsExpanded } = useStoreShallow(selector);
}
```

**NEVER store server data in Zustand — use React Query.**
