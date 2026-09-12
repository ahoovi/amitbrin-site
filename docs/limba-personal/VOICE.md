# GPT Live integration · 12 September 2026

The existing preview branch now includes GPT Live voice practice. Do not merge to main or promote without the user's production authorization. The OpenAI secret is scoped only to this branch's Preview environment; never copy it into Git, the browser, or logs.

## Implementation

- `src/lib/limba/voice.ts`: fixed `gpt-live-1`, `marin`, optional reasoning via hosted Responses delegation to `gpt-5.6-terra` without tools, selected course excerpts and recent topic-specific learning evidence. Reference material is data, not authority to perform actions. Creation retries disabled.
- `src/app/api/limba/voice/[action]/route.ts`: authenticated same-origin start/check/finish; server-defined model/instructions; ownership-bound provider session ID. JSON/SDP limits; no user-selected account/model/instructions.
- `public/limba-personal/voice.js`: WebRTC media tracks, `oai-events` data channel, wait for `session.started`, optional captions, pause microphone capture and local playback, graceful close, server hangup fallback and pagehide cleanup. Never treats captions as scored learning evidence.
- `002-voice.sql`: additive session metadata and shared daily start quota. No audio or transcripts stored by this app. OpenAI session `store:false` prevents opt-in recording storage; provider standard data policies still apply.
- Personal page allows same-origin microphone and media playback. Camera remains disabled. Source excerpts are explicitly included in the Vercel server artifact.

Initial diagnostic stays typed. Voice is available in topic practice. End-of-practice progress remains a self-report, not a verified automatic speech assessment. Voice metadata does not create fake learning achievements.

## Limits and billing

12 startup attempts per learner per UTC day, including failed/uncertain attempts. The browser ends calls at selected 5/10/15/20 minutes and ends reading pauses after 60 seconds. These browser timers are usability safeguards, not a hard server-side spending cap. Input mute does not suspend inference or billing. Use OpenAI project billing limits and build durable server-side session enforcement before broader access. Do not advertise current timers as guaranteed cost limits. Hosted Responses work also has token charges, separate from voice duration.

No global Vercel deployment protection was disabled. Preview share links expire; visiting before expiry does not create permanent access. To go permanent, choose a stable protected app URL or merge the reviewed feature into the existing production deployment after explicit authorization. Preserve Neon and account IDs through that change.

## Verification status

Full Next build and focused TypeScript/ESLint passed; course JSON present in the traced server artifact. Voice lifecycle checks cover startup gating, microphone/playback pause, cumulative usage, overlapping captions and cleanup. Existing 33 cloud progress regressions passed with scoped cleanup.

Current verification (2026-09-12): the replacement OPENAI_API_KEY is valid. The authenticated read-only models.retrieve probe returned HTTP 200 for gpt-live-1 on deployment amitbrin-site-o1oowvfmx-ahoovis-projects.vercel.app (dpl_DqB89Vo4NmpSCeZMCAA9nSmrQfHy). A real browser WebRTC start then reached OpenAI but returned HTTP 429 with code credit_balance_exhausted. This supersedes the earlier 401 key failure. The remaining blocker is API prepaid credit in the key's organization. No successful live session has been established yet; do not claim speech quality, pause/resume or final-close verification. The user must fund API billing; no key replacement or redeploy is required solely for a balance update. After the user confirms credits, verify one short real WebRTC session, pause/resume and final close. Do not repeatedly retry billed starts while the balance is exhausted. No production deployment or main merge was performed.

## Official references checked

- https://developers.openai.com/api/docs/guides/voice-webrtc?api=live
- https://developers.openai.com/api/docs/guides/live-conversations
- https://developers.openai.com/api/docs/guides/live-prompting

Preserve GPT Live's event contract; do not substitute legacy Realtime `response.create` or multipart session creation. Backend tools would require a separate reviewed implementation; no progress-writing tools are currently exposed to the model.

Read-only probe: set LIMBA_PREVIEW_SHARE_URL to a current deployment sharing link and run `node scripts/limba/check-live-access.mjs`. A branch alias share may require a new token after redeployment; obtain a valid link for the exact deployment before interpreting a Vercel protection response as an application error.
