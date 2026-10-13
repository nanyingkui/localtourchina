# Kakao integration — pending account access

User confirmed KakaoTalk channel is the customer entry and KakaoTalk is the operator reminder destination. No paid subscription has been authorized at a specific price.

Implemented local reminder-policy.mjs and four meaningful tests: 30-minute unanswered threshold, inactive exclusions, stable deduplication keys, bounded retry backoff and authenticated admin-only destination link. This module has not been connected to a scheduled sender. A unit test of retry timing is not verification of a live delivery worker.

Kakao Developers login button reused an existing session and shows account ku. However, /console/app remained at a loading spinner. Channel center redirected to business.kakao.com and did not finish rendering. No applications, existing integration providers or channel permissions could be confirmed. Do not claim an empty application list or absence of a provider.

Official self-message API can send to the logged-in user's 나와의 채팅; it does not read channel conversations. Customer conversation integration requires separate verification of the channel's official supported consultation integration. Do not confuse channel friend events or ordinary message API with incoming conversation synchronization.

Next: user opens https://developers.kakao.com/console/app and https://center-pf.kakao.com in their working browser and confirms access. Verify app, channel identity and privileges; then wire server-only token storage, signed/authenticated webhooks, deduplicated incoming messages, delivery outbox, recurring overdue escalation and delivery failure visibility. Test real inbound message and operator notification before marking complete. Do not expose credentials, full conversation texts or customer progress tokens in notification messages.

Sources: https://developers.kakao.com/docs/ko/kakaotalk-message/rest-api and https://business.kakao.com/info/chatbot/.
