# Kakao reminders live / Kakao 알림 운영

User authorized only messages to their own 나와의 채팅 and encrypted server token storage. User confirmed actual test receipt. App 1607023; login enabled, only talk_message lazy consent enabled; profile, friends, email and phone scopes not requested. Callback and client-secret configuration retained. Credentials reside in Supabase Vault, not tracked files.

Scheduler: pg_cron every 5 minutes, independent of local computer. Scans all active inquiries without a first-200-row cap. Unanswered threshold 30 minutes; agreed follow-up deadlines include paused clients; completed/cancelled/closed clients excluded. Stable keys prevent repeated polling from recreating events. Overdue follow-ups recur daily until handled.

Messages summarize up to 200 pending events, include at most ten unique inquiry references and an admin link, and are throttled to one digest per 15 minutes. Remaining events remain queued. Messages do not contain contact information, customer names, full conversations or progress tokens. Worker mutex prevents overlapping sends. Rate limits back off; uncertain delivery outcomes are recorded for operator review rather than resent automatically.

Admin displays connected/enabled status, last successful run, pending count, failed/uncertain count and recent delivery history. Old success timestamps over 15 minutes are highlighted. Update follow-up time, mark first reply and customer stage when work is completed; the system does not infer that a human answered a chat which is not yet integrated.

Verified: real OAuth callback stored tokens, provider accepted connection test and user received it; real refresh returned HTTP 200 refreshed=true; unauthorized endpoint request HTTP 403; two identical SQL enqueue calls produced one delivery (transaction rolled back); cron runs at 14:00 and 14:05 UTC succeeded. 111 frontend/module tests pass; 47-page release check passes. Runtime/state tables have RLS and deliberately no client policies. Secret read/store functions are service-role-only; authenticated users cannot read runtime table or secrets. Admin status RPC checks is_admin. Existing unrelated password-security advisory remains documented in crm-20261013.md.

Chat synchronization remains incomplete. Channel business verification is approved; Kanana AI assistant and channel web push already enabled. Recommended provider ChannelTalk is listed by Kakao. Actual ChannelTalk workspace URL/API access not yet verified. No account payment, provider contract, channel transition or customer data transfer to ChannelTalk performed. Old channel transcripts/memos must be retained and a concrete transition reviewed before enabling 상담톡.

Kakao 후속 알림을 본인의 나와의 채팅으로 연결했습니다. 서버가 5분마다 확인하고, 미응답과 후속 상담 일정을 묶어 최대 15분 간격으로 안내합니다. 실제 테스트 수신과 토큰 갱신을 확인했습니다. 채팅 자동 동기화는 ChannelTalk 계정과 API 권한 확인, 기존 상담 기록 보관 후 진행해야 합니다.
