# XIV private desk

The website entry is `/desk`. Marcelo's September 8 direction makes this a private agent desk: research requests, real status and sourced results. Most analysis journaling belongs on MaloSound.ai. The research API and screen are ready for publication; the database additions are applied, while a real session connection remains pending. See [XIV_RESEARCH_QUEUE.md](XIV_RESEARCH_QUEUE.md). Existing saved notes, day layouts and preparation drafts are preserved at `/desk/notes`. The public blog and games remain public.

## Connection and setup

The original private desk was deployed on September 8, 2026, with a free Supabase project, a manually admitted owner account and the existing Vercel hosting project. The78dc9eb release added password recovery and the redirected asset-path repair. The next research release passed190 local desk tests and a production build; migrations0002 and0003 were then applied to the existing project and their live permissions checked. Record the actual Vercel deployment separately before claiming that release available. Actual owner sign-in, cloud saving and cross-device recovery still require an end-to-end check. Missing configuration returns an unavailable screen. The following setup steps document initial provisioning: do not recreate the already configured project, any already applied migration, user or membership.

Supabase supplies account login and PostgreSQL storage. Signing into its dashboard is separate from the email/password account used inside the desk.

1. Sign into the Supabase dashboard and choose the intended project. If none exists, create a project on a free plan. Keep the database password in a password manager, never Git or chat.
2. Run `supabase/migrations/202609080001_xiv_private_desk.sql` once through the project's SQL editor. This creates new desk tables only. It does not import any local trading history.
3. Turn off public user signup in Auth settings. Create Marcelo's email/password user through the admin dashboard with a password he controls. Record that user's actual UUID; do not admit the first visitor or use an email address as the authorization rule.
4. Insert that exact UUID into `public.xiv_desk_members` with `enabled = true` using the SQL editor. There is no membership creation endpoint or client permission to enroll.
5. Copy `.env.desk.example` to the ignored `.env.local` for development and enter the project URL, publishable key, owner UUID, and exact site origin. Use the publishable key, never the service-role key. For development the origin is the local URL, for example `http://127.0.0.1:8425`.
6. Set the same four names in the existing Vercel project's production environment, using the actual canonical HTTPS origin. A preview needs its own exact origin configuration. Redeploy after changing environment variables.
7. Set the Supabase Auth Site URL to the canonical `/desk` URL and allow the exact canonical `/desk/recover` redirect, without a wildcard. Recovery email delivery also depends on the project's email-service configuration and rate limits. Request recovery from the website, not the dashboard's generic email action: the website stores the PKCE verifier in the requesting browser.
8. Sign in at `/desk`, capture a synthetic thought, save, reload, and open a second browser/device. Check conflict recovery and logout before calling the cloud connection verified.

## Forgotten password

Choose **Forgot password?** at `/desk`, or visit `/desk/recover`. Request the email and open its link in the same browser that requested it. A different browser lacks the PKCE verifier and must request a new link itself. A request being accepted does not prove delivery; check spam, and respect the provider's resend limits.

The recovery page exchanges the single-use code once, removes it from the visible URL and verifies the configured owner and enabled membership before showing the new-password form. The owner enters and submits a new password of at least 12 characters. No agent needs to receive or store it. A successful update clears this browser's session and requests global sign-out; existing access tokens on other devices may remain valid until expiry. Sign in again with the new password. Email links do not create membership or open public signup.

Recovery follows Supabase's [password reset](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail) and [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow) flows. No service-role key, auth token in localStorage or arbitrary redirect is used.

## Stored and unavailable

Each day stores the original thought text, capture source, optional filename, card coordinates, camera, and unfinished capture text. Saves append a version and update the current day atomically. Two devices editing the same revision cannot silently replace each other: export unsaved text before explicitly refreshing a conflict. This is saved cloud state with manual Refresh, not live collaborative editing.

Confirmed preparation drafts are deterministic formatting of the user's notes. They are not AI analysis, verified market facts, orders, or approval. Voice recognition may use the browser vendor's service; its text is reviewed before becoming a draft. Microphone behavior depends on browser support and permission.

No Gold data, broker records, credentials, or local research files are uploaded. Quant and historical journal review remain desktop-only. The online workspace does not start Codex or Claude, call a model, run a background researcher, or synchronize the existing local SQLite desk automatically.

## Access and recovery

Every private request verifies the Supabase user with the server and checks both the configured owner UUID and enabled membership. Database row policies independently restrict access to the authenticated owner. Saves run through one revision-checked database function. There is no public signup, checkout, or subscription gate in this personal workspace.

Session cookies are HttpOnly, SameSite Strict, and Secure in production. The browser never stores auth tokens in localStorage or links. Private responses are not cached. Logout clears the private iframe and session cookies. Keep a personal browser session off shared computers.

To revoke access immediately, set the member's `enabled` value to false and revoke that user's Auth sessions in Supabase. If recovery email is unavailable, inspect the project's email settings; do not create a replacement owner, disable authentication or change membership to bypass recovery. Keep an offline recovery/export copy of important notes. There is no in-app version restore screen yet, but saved revisions remain in `xiv_desk_versions` for deliberate owner recovery.

## Verification

Use Node 22, matching the tested runtime and the Supabase SDK's Node 22 minimum. Run `npm run test:desk`, `npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm run build`.

API tests inject a synthetic SDK directly into the test function; no request header, environment variable, or production login bypass exists. One isolated test also uses the actual SSR SDK with a fake HTTP response to verify that reset requests persist the PKCE verifier in protected cookies. Database tests execute the actual migration in local PGlite, including row policies, grants, revision conflicts, rollback, and disk reopening. These tests establish local behavior; they do not establish recovery email delivery or an actual signed-in save on the deployed site.

This change upgrades the existing unsupported Next 14 dependency to the maintained Next 15 line and updates its React dependencies. Public routes require a build and smoke check as part of review.
