# Build Fixes

We've fixed two main issues with the build:

1. Fixed the useSearchParams issue by wrapping the components in a Suspense boundary in:
   - src/app/auth/signup/page.tsx
   - src/app/rooms/page.tsx

2. Fixed the dynamic params issue by using await with params in:
   - src/app/api/rooms/[id]/route.ts
   - src/app/api/rooms/[id]/messages/route.ts
   - src/app/api/user/notifications/[id]/route.ts
   - src/app/api/rooms/[id]/join/route.ts
   - src/app/api/rooms/[id]/invite/route.ts
   - src/app/api/messages/[id]/route.ts

Example fix for dynamic params:
```typescript
// Before
const id = context.params.id;

// After
const { id } = await context.params;
```

To build the application, you'll need to restart your dev server or rebuild with clean caches. 