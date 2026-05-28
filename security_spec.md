# Security Specification - Giffoni School

## Data Invariants
1. A user can only access their own profile and enrollment data.
2. Only authorized BOSS roles can modify the Home sections and Course catalog.
3. Enrollment requires a valid order/payment (simulated or verified).
4. Course content is only accessible to enrolled users or BOSS admins.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoof**: User A trying to update User B's role to 'SUPER_BOSS'.
2. **Schema Poison**: Trying to inject a 1MB string into a course `slug`.
3. **State Shortcut**: User trying to mark an enrollment as 'active' without payment.
4. **Unauthenticated Write**: Trying to add a `home_section` without being logged in.
5. **Role Escalation**: An `ALUNO` trying to access `/boss/home` data.
6. **Orphan Record**: Creating an enrollment for a non-existent courseId.
7. **Ghost Field**: Adding `isVerified: true` to a user profile via client SDK.
8. **PII Leak**: Non-admin user trying to `list` all users' emails.
9. **Deletion of Wallet**: Flooding the database with 10k draft courses.
10. **Immutable Alteration**: Trying to change `createdAt` on a course.
11. **ID Injection**: Using a 500-char ID for a new course.
12. **Query Scraping**: Authenticated user trying to `list` home sections that are `isActive: false`.

## Rules Implementation Strategy
- Use `isValidId()` for all document IDs.
- Use `isValidUser()`, `isValidCourse()`, `isValidHomeSection()` helpers.
- Use `affectedKeys().hasOnly()` for updates.
- Restrict `list` operations to specific query filters.
