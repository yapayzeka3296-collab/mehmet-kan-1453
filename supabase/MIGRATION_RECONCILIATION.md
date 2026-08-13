# MySkyParcel Supabase migration reconciliation

Production project: `agfxwddvobkhwbbrdzpt`

The old `0001`-`0011` migration set did not represent the production migration history and contained a duplicate `0005` version. Those files are preserved verbatim under `supabase/legacy-migrations/` and are no longer treated as deployable migrations.

Production currently tracks 21 timestamped migrations through `20260812095028_harden_owned_parcel_certificate_issuance`.

`supabase/production-migration-history.json` records the read-only production history. `supabase/production-schema-inventory.json` records the verified public tables, RLS state, policies, indexes, triggers and functions observed in production.

No production migration history was repaired, rewritten, or pushed by this reconciliation commit.

Future deployable migrations must use unique UTC timestamps in `YYYYMMDDHHMMSS_description.sql` format and must be created only after the production state has been captured and validated. This follows the Supabase migration convention.

The application source, routes, UI, authentication flow and existing production security objects were not modified by this reconciliation.
