# Production admin account recovery

Live read-only evidence confirmed the historical administrator exists, has a confirmed email and retains admin_users membership. Auth logs distinguish invalid password credentials from over_email_send_rate_limit. No administrator privilege, password hash, auth token or RLS changes were made.

Changes: add supported Auth recovery-mail request and first-party recovery-link validation; open authenticated password setup after recovery; refresh expired sessions with a single concurrent refresh, preserving sessions on transient failure and preventing revival after logout. Search includes original inquiry content and travel dates, so optional-name inquiries remain discoverable. Normalize Auth error_code responses and share a persisted mail cooldown. Prevent legacy asset sync from overwriting maintained admin-login.mjs.

Validation: production build; 144 passing tests; release checker: 48 pages, 135 inline scripts, zero missing references. Session tests cover rotation, concurrency, expiry, transient errors, revoked sessions, logout races and 403. Recovery tests use synthetic values only; no test email or test inquiry was sent.

Human handoff remains necessary: account holder reads the mailbox and personally sets their password. Successful production password login must be verified before claiming recovery complete. Default mail provider quota has not been changed; custom SMTP would require a verified provider account and configuration. Private customer findings remain outside the repository.
