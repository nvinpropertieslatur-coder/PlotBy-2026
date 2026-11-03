# Current property access behavior

Guest testing is now enabled without compulsory sign-in. Add Property opens directly and saves guest/test submissions in a separate device-local AsyncStorage workspace. Guest navigation does not run account ownership preflight or fetch account property rows. The current implementation and exact changes are documented in GUEST-MODE-CHANGES.md.

Signed-in operations still use the original Supabase client and the verified auth user's id. The live zero-row ownership probe returned PostgreSQL 42703: column properties.user_id does not exist. This is a backend prerequisite ONLY for signed-in account storage; it does not block guest UI/submission tests.

The existing database/01-inspect-property-access.sql is read-only policy/column diagnostics. database/02-add-property-owner.review.sql is an unapplied additive ownership proposal. An administrator must inspect the current grants/RLS and determine the appropriate owner policies before enabling private account storage. No policy has been changed, disabled or broadened. Public/service-role secrets are not required or added to the mobile app.

Existing records are not assigned to whoever signs in, and local guest records are not uploaded automatically. Supabase-backed guest submissions are not part of this device-local testing mode. No new guest table or guest database policy is needed for the implemented local flow.
