# TODO — Fix Profile Update (PUT /api/profile/update)

## Root Cause

Frontend `components/Header.tsx` sends `PUT /api/profile/update` and `PUT /api/profile/change-password`, but `server.js` only registers **POST** versions. The global 404 handler returns `Route not found: PUT /api/profile/update`. The existing POST update handler also wrongly requires `email` in the body, while the frontend only sends `{ role }`.

## Steps

- [x] Inspect project structure & determine backend framework (Express)
- [x] Locate frontend PUT calls (components/Header.tsx)
- [x] Verify backend routes (server.js uses POST only)
- [x] Add `PUT /api/profile/update` (JWT auth, accept `{ role }`, keep existing POST)
- [x] Add `PUT /api/profile/change-password` (JWT auth, keep existing POST)
- [x] Verify no unrelated code changed
- [x] Syntax-check server.js (node --check passed)
- [x] Verify Vite proxy routes /api to backend
- [ ] Test profile update & password change flow
