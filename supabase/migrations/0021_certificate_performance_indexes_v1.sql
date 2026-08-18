-- Certificate query-path indexes. These are additive and do not change existing security semantics.
CREATE INDEX IF NOT EXISTS certificate_audit_actor_idx
  ON public.certificate_audit_log(actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS certificate_issued_by_idx
  ON public.certificate_requests(issued_by)
  WHERE issued_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS certificate_approved_by_idx
  ON public.certificate_requests(approved_by)
  WHERE approved_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS certificate_rejected_by_idx
  ON public.certificate_requests(rejected_by)
  WHERE rejected_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS certificate_revoked_by_idx
  ON public.certificate_requests(revoked_by)
  WHERE revoked_by IS NOT NULL;
