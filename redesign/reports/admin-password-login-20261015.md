# Administrator password login

Password login is the primary admin entry; email verification remains collapsed as a fallback. The password grant is sent directly to the existing configured Supabase Auth endpoint. The existing is_admin RPC must succeed before displaying the workspace and persisting a new authenticated session. Passwords are never saved in local/session storage, inquiry records or logs; form fields clear after a request.

An authenticated administrator can open “设置／修改登录密码” and personally set a password for their own account using Auth PUT /user. This is a human handoff: the agent must not enter, read, set or choose the real password. No SQL, RLS policy, administrator membership or public sign-up setting changes are included.

Existing Chrome sessions can be used to set a password without requesting another email, subject to the Auth service's session/re-authentication rules. An account without a usable session or an existing password still needs identity verification. Do not bypass this check or manufacture a shared admin password.

Validation: mocked password-grant and own-user password-change requests; mismatch/weak-password guards; existing email-link and email-limit tests; full release check. Real password setup/sign-in requires the account holder to complete it. The customer inquiry for 이철민 (3 travellers, November 2/3) remains unverified pending authenticated access.
