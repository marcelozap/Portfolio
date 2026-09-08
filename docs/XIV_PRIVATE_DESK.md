# XIV private desk

The website entry is `/desk`. It is Marcelo's private workspace, with draggable thoughts, voice capture when the browser supports it, day layouts, saved notes, and confirmed preparation drafts. The public blog and games remain public.

## Connection required

The code is implemented locally. A live Supabase project, owner account, migration, and deployment configuration are still required. Missing configuration returns an unavailable screen; it never opens private data or pretends to save online.

Supabase supplies account login and PostgreSQL storage. Signing into its dashboard is separate from the email/password account used inside the desk.

1. Sign into the Supabase dashboard and choose the intended project. If none exists, create a project on a free plan. Keep the database password in a password manager, never Git or chat.
2. Run `supabase/migrations/202609080001_xiv_private_desk.sql` once through the project's SQL editor. This creates new desk tables only. It does not import any local trading history.
3. Turn off public user signup in Auth settings. Create Marcelo's email/password user through the admin dashboard with a password he controls. Record that user's actual UUID; do not admit the first visitor or use an email address as the authorization rule.
4. Insert that exact UUID into `public.xiv_desk_members` with `enabled = true` using the SQL editor. There is no membership creation endpoint or client permission to enroll.
5. Copy `.env.desk.example` to the ignored `.env.local` for development and enter the project URL, publishable key, owner UUID, and exact site origin. Use the publishable key, never the service-role key. For development the origin is the local URL, for example `http://127.0.0.1:8425`.
6. Set the same four names in the existing Vercel project's production environment, using the actual canonical HTTPS origin. A preview needs its own exact origin configuration. Redeploy after changing environment variables.
7. Sign in at `/desk`, capture a synthetic thought, save, reload, and open a second browser/device. Check conflict recovery and logout before calling the cloud connection verified.

## Stored and unavailable

Each day stores the original thought text, capture source, optional filename, card coordinates, camera, and unfinished capture text. Saves append a version and update the current day atomically. Two devices editing the same revision cannot silently replace each other: export unsaved text before explicitly refreshing a conflict. This is saved cloud state with manual Refresh, not live collaborative editing.

Confirmed preparation drafts are deterministic formatting of the user's notes. They are not AI analysis, verified market facts, orders, or approval. Voice recognition may use the browser vendor's service; its text is reviewed before becoming a draft. Microphone behavior depends on browser support and permission.

No Gold data, broker records, credentials, or local research files are uploaded. Quant and historical journal review remain desktop-only. The online workspace does not start Codex or Claude, call a model, run a background researcher, or synchronize the existing local SQLite desk automatically.

## Access and recovery

Every private request verifies the Supabase user with the server and checks both the configured owner UUID and enabled membership. Database row policies independently restrict access to the authenticated owner. Saves run through one revision-checked database function. There is no public signup, checkout, or subscription gate in this personal workspace.

Session cookies are HttpOnly, SameSite Strict, and Secure in production. The browser never stores auth tokens in localStorage or links. Private responses are not cached. Logout clears the private iframe and session cookies. Keep a personal browser session off shared computers.

To revoke access immediately, set the member's `enabled` value to false and revoke that user's Auth sessions in Supabase. Password recovery is an administrator-assisted operation through Supabase for this first version; a self-service reset screen is not built. Keep an offline recovery/export copy of important notes. There is no in-app version restore screen yet, but saved revisions remain in `xiv_desk_versions` for deliberate owner recovery.

## Verification

Run `npm run test:desk`, `npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm run build`.

API tests inject a synthetic SDK directly into the test function; no request header, environment variable, or production login bypass exists. Database tests execute the actual migration in local PGlite, including row policies, grants, revision conflicts, rollback, and disk reopening. Those tests establish local behavior; they do not establish that a live Supabase or Vercel deployment is connected.

This change upgrades the existing unsupported Next 14 dependency to the maintained Next 15 line and updates its React dependencies. Public routes require a build and smoke check as part of review.
