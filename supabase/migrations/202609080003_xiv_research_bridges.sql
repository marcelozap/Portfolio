-- Offline capability bridge foundation. No token is created here, no worker is
-- started, and no outbound connection is made. Apply after migrations 0001/0002.
BEGIN;

CREATE SCHEMA xiv_private;
REVOKE ALL ON SCHEMA xiv_private FROM PUBLIC, anon, authenticated;

CREATE TABLE xiv_private.research_bridges (
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  id uuid NOT NULL,
  token_sha256 text NOT NULL UNIQUE CHECK (token_sha256 ~ '^[0-9a-f]{64}$'),
  session text NOT NULL CHECK (session ~ '^(codex|claude):[A-Za-z0-9_-]{8,128}$'),
  created_at timestamptz NOT NULL CHECK (isfinite(created_at)),
  expires_at timestamptz NOT NULL CHECK (isfinite(expires_at)
    AND expires_at <= TIMESTAMPTZ '2026-09-19T23:52:32Z'),
  revoked_at timestamptz CHECK (isfinite(revoked_at)),
  last_seen_at timestamptz CHECK (isfinite(last_seen_at)),
  PRIMARY KEY (owner_id, id)
);

CREATE TABLE xiv_private.research_bridge_events (
  owner_id uuid NOT NULL,
  bridge_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('register', 'revoke')),
  occurred_at timestamptz NOT NULL CHECK (isfinite(occurred_at)),
  metadata jsonb NOT NULL CHECK (jsonb_typeof(metadata) = 'object'),
  PRIMARY KEY (owner_id, bridge_id, action),
  FOREIGN KEY (owner_id, bridge_id) REFERENCES xiv_private.research_bridges(owner_id, id)
);

ALTER TABLE xiv_private.research_bridges ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiv_private.research_bridge_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON xiv_private.research_bridges, xiv_private.research_bridge_events
  FROM PUBLIC, anon, authenticated;

ALTER TABLE public.xiv_research_tasks ADD COLUMN bridge_id uuid;
ALTER TABLE public.xiv_research_tasks ADD CONSTRAINT xiv_research_tasks_bridge_fk
  FOREIGN KEY (owner_id, bridge_id) REFERENCES xiv_private.research_bridges(owner_id, id);
ALTER TABLE public.xiv_research_tasks ADD CONSTRAINT xiv_research_tasks_bridge_claim_check
  CHECK (bridge_id IS NULL OR claim_id IS NOT NULL);

CREATE FUNCTION xiv_private.bridge_metadata(p_bridge xiv_private.research_bridges)
RETURNS jsonb LANGUAGE sql STABLE SET search_path = pg_catalog
AS $function$
  SELECT jsonb_build_object(
    'id', p_bridge.id, 'session', p_bridge.session,
    'created_at', p_bridge.created_at, 'expires_at', p_bridge.expires_at,
    'revoked_at', p_bridge.revoked_at, 'last_seen_at', p_bridge.last_seen_at
  );
$function$;

CREATE FUNCTION xiv_private.research_member(p_owner uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog
AS $function$
DECLARE
  v_enabled boolean;
BEGIN
  IF p_owner IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Research capability is unavailable.';
  END IF;
  SELECT m.enabled INTO v_enabled FROM public.xiv_desk_members m
    WHERE m.user_id = p_owner FOR SHARE;
  IF v_enabled IS DISTINCT FROM true THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Research capability is unavailable.';
  END IF;
END;
$function$;

-- Resolve with the digest, then lock in membership -> bridge -> task order.
-- Recheck the capability after its row lock; revocation cannot race a successful use.
CREATE FUNCTION xiv_private.research_capability(p_bridge_id uuid, p_token text)
RETURNS xiv_private.research_bridges
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog
AS $function$
DECLARE
  v_owner uuid;
  v_digest text;
  v_bridge xiv_private.research_bridges%ROWTYPE;
BEGIN
  IF p_bridge_id IS NULL OR p_token IS NULL OR p_token !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Research capability is unavailable.';
  END IF;
  v_digest := encode(sha256(convert_to(p_token, 'UTF8')), 'hex');
  SELECT b.owner_id INTO v_owner FROM xiv_private.research_bridges b
    WHERE b.id = p_bridge_id AND b.token_sha256 = v_digest;
  PERFORM xiv_private.research_member(v_owner);
  SELECT b.* INTO v_bridge FROM xiv_private.research_bridges b
    WHERE b.owner_id = v_owner AND b.id = p_bridge_id FOR UPDATE;
  IF NOT FOUND OR v_bridge.token_sha256 IS DISTINCT FROM v_digest
     OR v_bridge.revoked_at IS NOT NULL OR v_bridge.expires_at <= clock_timestamp() THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Research capability is unavailable.';
  END IF;
  RETURN v_bridge;
END;
$function$;

-- Static copy of migration 0002's validated transition body, factored behind
-- explicit trusted owner/capability arguments. Historical migration 0002 stays intact.
CREATE FUNCTION xiv_private.research_apply(
  p_owner uuid, p_bridge_id uuid, p_bridge_expiry timestamptz,
  p_task_id uuid, p_expected_version integer, p_action text, p_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
DECLARE
  v_owner uuid := p_owner;
  v_enabled boolean;
  v_task public.xiv_research_tasks%ROWTYPE;
  v_exists boolean;
  v_now timestamptz;
  v_keys text[];
  v_claim uuid;
  v_result jsonb;
  v_source jsonb;
  v_retrieved text;
  v_timestamp timestamptz;
  v_url text;
  v_port text;
BEGIN
  -- Only trusted wrappers can invoke this private core. Owner and capability
  -- context are explicit arguments; no JWT/session setting is rewritten.
  IF (p_bridge_id IS NULL AND (p_bridge_expiry IS NOT NULL OR p_action IS NULL
      OR p_action NOT IN ('create', 'cancel', 'retry')))
     OR (p_bridge_id IS NOT NULL AND (p_action IS NULL
      OR p_action NOT IN ('claim', 'renew', 'complete', 'block'))) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Research action is unavailable.';
  END IF;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'An enabled desk member is required.';
  END IF;
  -- Prevent concurrent membership revocation from racing a successful mutation.
  SELECT m.enabled INTO v_enabled FROM public.xiv_desk_members AS m
    WHERE m.user_id = v_owner FOR SHARE;
  IF v_enabled IS DISTINCT FROM true THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'An enabled desk member is required.';
  END IF;
  IF p_task_id IS NULL OR p_expected_version IS NULL
     OR p_expected_version NOT BETWEEN 0 AND 1000000000
     OR p_action IS NULL OR p_action NOT IN ('create', 'claim', 'renew', 'complete', 'block', 'cancel', 'retry')
     OR jsonb_typeof(p_payload) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid research action arguments.';
  END IF;
  v_keys := CASE p_action
    WHEN 'create' THEN ARRAY['question', 'scope']
    WHEN 'claim' THEN ARRAY['worker_session']
    WHEN 'renew' THEN ARRAY['claim_id']
    WHEN 'complete' THEN ARRAY['claim_id', 'result']
    WHEN 'block' THEN ARRAY['claim_id', 'reason']
    WHEN 'cancel' THEN ARRAY['reason']
    WHEN 'retry' THEN ARRAY[]::text[] END;
  IF NOT (p_payload ?& v_keys) OR p_payload - v_keys <> '{}'::jsonb THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid research action fields.';
  END IF;

  IF p_action = 'create' THEN
    IF p_expected_version <> 0
       OR jsonb_typeof(p_payload->'question') IS DISTINCT FROM 'string'
       OR char_length(p_payload->>'question') NOT BETWEEN 1 AND 12000
       OR (p_payload->>'question') !~ '[^[:space:]]'
       OR jsonb_typeof(p_payload->'scope') IS DISTINCT FROM 'string'
       OR (p_payload->>'scope') IS DISTINCT FROM 'public_primary_sources' THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid research question or scope.';
    END IF;
  ELSIF p_action = 'claim' THEN
    -- Session association is asserted provenance, not proof of an agent identity.
    IF jsonb_typeof(p_payload->'worker_session') IS DISTINCT FROM 'string'
       OR (p_payload->>'worker_session') !~ '^(codex|claude):[A-Za-z0-9_-]{8,128}$' THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid worker session.';
    END IF;
  END IF;
  IF p_action IN ('renew', 'complete', 'block') THEN
    IF jsonb_typeof(p_payload->'claim_id') IS DISTINCT FROM 'string'
       OR (p_payload->>'claim_id') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid claim identity.';
    END IF;
    v_claim := (p_payload->>'claim_id')::uuid;
  END IF;
  IF p_action IN ('block', 'cancel') THEN
    IF jsonb_typeof(p_payload->'reason') IS DISTINCT FROM 'string'
       OR char_length(p_payload->>'reason') NOT BETWEEN 1 AND 4000
       OR (p_payload->>'reason') !~ '[^[:space:]]' THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid research action reason.';
    END IF;
  END IF;
  IF p_action = 'complete' THEN
    v_result := p_payload->'result';
    IF jsonb_typeof(v_result) IS DISTINCT FROM 'object' THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid research result.';
    END IF;
    IF NOT (v_result ?& ARRAY['text', 'sources', 'limitations'])
       OR v_result - ARRAY['text', 'sources', 'limitations'] <> '{}'::jsonb
       OR jsonb_typeof(v_result->'text') IS DISTINCT FROM 'string'
       OR char_length(v_result->>'text') NOT BETWEEN 1 AND 20000
       OR (v_result->>'text') !~ '[^[:space:]]'
       OR jsonb_typeof(v_result->'limitations') IS DISTINCT FROM 'string'
       OR char_length(v_result->>'limitations') > 4000
       OR jsonb_typeof(v_result->'sources') IS DISTINCT FROM 'array'
       OR octet_length(v_result::text) > 100000 THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid research result fields or size.';
    END IF;
    IF jsonb_array_length(v_result->'sources') NOT BETWEEN 1 AND 30 THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Between one and thirty sources are required.';
    END IF;
    FOR v_source IN SELECT value FROM jsonb_array_elements(v_result->'sources') LOOP
      IF jsonb_typeof(v_source) IS DISTINCT FROM 'object' THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid research source.';
      END IF;
      IF NOT (v_source ?& ARRAY['url', 'title', 'retrieved_at'])
         OR v_source - ARRAY['url', 'title', 'retrieved_at'] <> '{}'::jsonb
         OR jsonb_typeof(v_source->'url') IS DISTINCT FROM 'string'
         OR char_length(v_source->>'url') NOT BETWEEN 1 AND 2000
         OR jsonb_typeof(v_source->'title') IS DISTINCT FROM 'string'
         OR char_length(v_source->>'title') NOT BETWEEN 1 AND 300
         OR (v_source->>'title') !~ '[^[:space:]]'
         OR jsonb_typeof(v_source->'retrieved_at') IS DISTINCT FROM 'string' THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid research source fields.';
      END IF;
      v_url := v_source->>'url';
      -- Conservative ASCII HTTPS URI subset: dotted DNS host, optional bounded port,
      -- valid percent escapes, no credentials, whitespace, controls, or backslashes.
      -- Syntax cannot establish public accessibility, primary authority, or truth.
      IF v_url !~ '^https://([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(:[0-9]{1,5})?([/?#]([A-Za-z0-9._~!$&''()*+,;=:@/?#-]|%[0-9A-Fa-f]{2})*)?$' THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'A valid HTTPS source URL without credentials is required.';
      END IF;
      v_port := substring(v_url FROM '^https://[^/:?#]+:([0-9]+)');
      IF v_port IS NOT NULL AND v_port::integer NOT BETWEEN 1 AND 65535 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid source URL port.';
      END IF;
      v_retrieved := v_source->>'retrieved_at';
      IF v_retrieved !~ '^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]{1,6})?Z$'
         OR left(v_retrieved, 4) = '0000' THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'A valid ISO UTC retrieval timestamp is required.';
      END IF;
      BEGIN
        v_timestamp := v_retrieved::timestamptz;
      EXCEPTION WHEN datetime_field_overflow OR invalid_datetime_format THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'A valid ISO UTC retrieval timestamp is required.';
      END;
    END LOOP;
  END IF;

  -- Canonical UUID text serializes create and all later actions for this owner/task.
  -- A hash collision only delays an unrelated task; it never changes its owner.
  PERFORM pg_advisory_xact_lock(hashtextextended(v_owner::text || ':' || p_task_id::text, 0));
  SELECT t.* INTO v_task FROM public.xiv_research_tasks AS t
    WHERE t.owner_id = v_owner AND t.id = p_task_id FOR UPDATE;
  v_exists := FOUND;
  -- Sample after BOTH locks: time spent waiting must count against an old lease.
  v_now := clock_timestamp();
  IF p_bridge_id IS NOT NULL AND (p_bridge_expiry IS NULL
     OR NOT isfinite(p_bridge_expiry) OR p_bridge_expiry <= v_now) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Research capability is unavailable.';
  END IF;

  IF p_action = 'create' THEN
    IF v_exists THEN
      IF v_task.question IS DISTINCT FROM p_payload->>'question'
         OR v_task.scope IS DISTINCT FROM p_payload->>'scope' THEN
        RAISE EXCEPTION USING ERRCODE = '40001', MESSAGE = 'This task identity already has different input.';
      END IF;
      RETURN to_jsonb(v_task);
    END IF;
    INSERT INTO public.xiv_research_tasks(owner_id, id, question, scope, role, version, status, created_at, updated_at)
      VALUES (v_owner, p_task_id, p_payload->>'question', 'public_primary_sources', 'research_analyst', 1, 'queued', v_now, v_now)
      RETURNING * INTO v_task;
  ELSE
    IF NOT v_exists THEN
      RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Research capability is unavailable.';
    END IF;
    IF p_expected_version <> v_task.version THEN
      RAISE EXCEPTION USING ERRCODE = '40001', MESSAGE = 'This research task changed. Reload before continuing.';
    END IF;
    IF v_task.version = 1000000000 THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'The research task version limit has been reached.';
    END IF;
    IF p_action IN ('renew', 'complete', 'block') THEN
      IF v_task.status IS DISTINCT FROM 'running'
         OR v_task.claim_id IS DISTINCT FROM v_claim
         OR v_task.bridge_id IS DISTINCT FROM p_bridge_id
         OR v_task.lease_expires_at IS NULL OR v_task.lease_expires_at <= v_now THEN
        RAISE EXCEPTION USING ERRCODE = '40001', MESSAGE = 'A matching live research claim is required.';
      END IF;
    END IF;
    CASE p_action
      WHEN 'claim' THEN
        IF v_task.status <> 'queued' THEN
          RAISE EXCEPTION USING ERRCODE = '40001', MESSAGE = 'Only queued research can be claimed.';
        END IF;
        v_task.status := 'running';
        v_task.worker_session := p_payload->>'worker_session';
        v_task.bridge_id := p_bridge_id;
        v_task.claim_id := gen_random_uuid();
        v_task.claimed_at := v_now;
        v_task.lease_expires_at := least(v_now + interval '15 minutes', p_bridge_expiry);
      WHEN 'renew' THEN
        v_task.lease_expires_at := least(v_now + interval '15 minutes', p_bridge_expiry);
      WHEN 'complete' THEN
        v_task.status := 'completed';
        v_task.result := v_result;
        v_task.completed_at := v_now;
        v_task.lease_expires_at := NULL;
      WHEN 'block' THEN
        v_task.status := 'blocked';
        v_task.blocked_reason := p_payload->>'reason';
        v_task.lease_expires_at := NULL;
      WHEN 'cancel' THEN
        IF v_task.status NOT IN ('queued', 'running', 'blocked') THEN
          RAISE EXCEPTION USING ERRCODE = '40001', MESSAGE = 'This research task cannot be cancelled.';
        END IF;
        v_task.status := 'cancelled';
        v_task.cancel_reason := p_payload->>'reason';
        v_task.blocked_reason := NULL;
        v_task.lease_expires_at := NULL;
      WHEN 'retry' THEN
        IF NOT (v_task.status = 'blocked' OR (v_task.status = 'running'
          AND v_task.lease_expires_at IS NOT NULL AND v_task.lease_expires_at <= v_now)) THEN
          RAISE EXCEPTION USING ERRCODE = '40001', MESSAGE = 'Only blocked or expired research can be retried.';
        END IF;
        v_task.status := 'queued';
        v_task.worker_session := NULL;
        v_task.bridge_id := NULL;
        v_task.claim_id := NULL;
        v_task.claimed_at := NULL;
        v_task.lease_expires_at := NULL;
        v_task.completed_at := NULL;
        v_task.result := NULL;
        v_task.blocked_reason := NULL;
        v_task.cancel_reason := NULL;
    END CASE;
    UPDATE public.xiv_research_tasks SET
      version = v_task.version + 1, status = v_task.status, updated_at = v_now,
      worker_session = v_task.worker_session, claim_id = v_task.claim_id,
      bridge_id = v_task.bridge_id,
      claimed_at = v_task.claimed_at, lease_expires_at = v_task.lease_expires_at,
      completed_at = v_task.completed_at, result = v_task.result,
      blocked_reason = v_task.blocked_reason, cancel_reason = v_task.cancel_reason
      WHERE owner_id = v_owner AND id = p_task_id RETURNING * INTO v_task;
  END IF;

  -- Same transaction as the task write. No client can append, edit, or delete events.
  INSERT INTO public.xiv_research_events(owner_id, task_id, version, action, occurred_at, snapshot)
    VALUES (v_owner, p_task_id, v_task.version, p_action, v_now, to_jsonb(v_task));
  RETURN to_jsonb(v_task);
END;
$function$;


CREATE OR REPLACE FUNCTION public.xiv_research_apply(
  p_task_id uuid, p_expected_version integer, p_action text, p_payload jsonb
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog
AS $function$
DECLARE
  v_owner uuid := auth.uid();
BEGIN
  PERFORM xiv_private.research_member(v_owner);
  IF p_action IS NULL OR p_action NOT IN ('create', 'cancel', 'retry') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Research action is unavailable.';
  END IF;
  RETURN xiv_private.research_apply(v_owner, NULL, NULL,
    p_task_id, p_expected_version, p_action, p_payload);
END;
$function$;

CREATE FUNCTION public.xiv_research_bridge_register(
  p_bridge_id uuid, p_session text, p_token_sha256 text, p_expires_at timestamptz
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog
AS $function$
DECLARE
  v_owner uuid := auth.uid();
  v_bridge xiv_private.research_bridges%ROWTYPE;
  v_now timestamptz;
  v_metadata jsonb;
BEGIN
  PERFORM xiv_private.research_member(v_owner);
  IF p_bridge_id IS NULL OR p_session IS NULL
     OR p_session !~ '^(codex|claude):[A-Za-z0-9_-]{8,128}$'
     OR p_token_sha256 IS NULL OR p_token_sha256 !~ '^[0-9a-f]{64}$'
     OR p_expires_at IS NULL OR NOT isfinite(p_expires_at) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid research bridge registration.';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('bridge:' || v_owner::text || ':' || p_bridge_id::text, 0));
  SELECT b.* INTO v_bridge FROM xiv_private.research_bridges b
    WHERE b.owner_id = v_owner AND b.id = p_bridge_id FOR UPDATE;
  v_now := clock_timestamp();
  IF FOUND THEN
    IF v_bridge.session IS DISTINCT FROM p_session
       OR v_bridge.token_sha256 IS DISTINCT FROM p_token_sha256
       OR v_bridge.expires_at IS DISTINCT FROM p_expires_at THEN
      RAISE EXCEPTION USING ERRCODE = '40001', MESSAGE = 'Research bridge registration conflicts.';
    END IF;
    -- A retry reports the existing state; it never reactivates or extends a bridge.
    RETURN xiv_private.bridge_metadata(v_bridge);
  END IF;
  IF p_expires_at <= v_now OR p_expires_at > v_now + interval '14 days'
     OR p_expires_at > TIMESTAMPTZ '2026-09-19T23:52:32Z' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Research bridge expiry is outside the allowed window.';
  END IF;
  BEGIN
    INSERT INTO xiv_private.research_bridges(owner_id, id, token_sha256, session, created_at, expires_at)
      VALUES (v_owner, p_bridge_id, p_token_sha256, p_session, v_now, p_expires_at)
      RETURNING * INTO v_bridge;
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION USING ERRCODE = '40001', MESSAGE = 'Research bridge registration conflicts.';
  END;
  v_metadata := xiv_private.bridge_metadata(v_bridge);
  INSERT INTO xiv_private.research_bridge_events(owner_id, bridge_id, action, occurred_at, metadata)
    VALUES (v_owner, p_bridge_id, 'register', v_now, v_metadata);
  RETURN v_metadata;
END;
$function$;

CREATE FUNCTION public.xiv_research_bridge_revoke(p_bridge_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog
AS $function$
DECLARE
  v_owner uuid := auth.uid();
  v_bridge xiv_private.research_bridges%ROWTYPE;
  v_now timestamptz;
  v_metadata jsonb;
BEGIN
  PERFORM xiv_private.research_member(v_owner);
  SELECT b.* INTO v_bridge FROM xiv_private.research_bridges b
    WHERE b.owner_id = v_owner AND b.id = p_bridge_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Research capability is unavailable.';
  END IF;
  IF v_bridge.revoked_at IS NOT NULL THEN RETURN xiv_private.bridge_metadata(v_bridge); END IF;
  v_now := clock_timestamp();
  UPDATE xiv_private.research_bridges SET revoked_at = v_now
    WHERE owner_id = v_owner AND id = p_bridge_id RETURNING * INTO v_bridge;
  v_metadata := xiv_private.bridge_metadata(v_bridge);
  INSERT INTO xiv_private.research_bridge_events(owner_id, bridge_id, action, occurred_at, metadata)
    VALUES (v_owner, p_bridge_id, 'revoke', v_now, v_metadata);
  RETURN v_metadata;
END;
$function$;

CREATE FUNCTION public.xiv_research_bridge_list()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog
AS $function$
DECLARE
  v_owner uuid := auth.uid();
  v_metadata jsonb;
BEGIN
  PERFORM xiv_private.research_member(v_owner);
  SELECT coalesce(jsonb_agg(xiv_private.bridge_metadata(b) ORDER BY b.created_at DESC, b.id DESC), '[]'::jsonb)
    INTO v_metadata FROM xiv_private.research_bridges b WHERE b.owner_id = v_owner;
  RETURN v_metadata;
END;
$function$;

CREATE FUNCTION public.xiv_research_bridge_read(
  p_bridge_id uuid, p_token text, p_task_id uuid DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog
AS $function$
DECLARE
  v_bridge xiv_private.research_bridges%ROWTYPE;
  v_task public.xiv_research_tasks%ROWTYPE;
  v_tasks jsonb;
  v_output jsonb;
  v_now timestamptz;
BEGIN
  v_bridge := xiv_private.research_capability(p_bridge_id, p_token);
  IF p_task_id IS NULL THEN
    SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.created_at, t.id), '[]'::jsonb)
      INTO v_tasks FROM (
        SELECT t.* FROM public.xiv_research_tasks t
        WHERE t.owner_id = v_bridge.owner_id
          AND (t.status = 'queued' OR (t.status = 'running' AND t.bridge_id = v_bridge.id))
        ORDER BY t.created_at, t.id LIMIT 20 FOR SHARE
      ) t;
    v_output := jsonb_build_object('tasks', v_tasks);
  ELSE
    SELECT t.* INTO v_task FROM public.xiv_research_tasks t
      WHERE t.owner_id = v_bridge.owner_id AND t.id = p_task_id
        AND (t.status = 'queued' OR t.bridge_id = v_bridge.id) FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Research capability is unavailable.';
    END IF;
    v_output := jsonb_build_object('task', to_jsonb(v_task));
  END IF;
  -- Reads may also wait for task rows. Do not return private data after expiry.
  v_now := clock_timestamp();
  IF v_bridge.expires_at <= v_now THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Research capability is unavailable.';
  END IF;
  UPDATE xiv_private.research_bridges SET last_seen_at = v_now
    WHERE owner_id = v_bridge.owner_id AND id = v_bridge.id;
  RETURN v_output;
END;
$function$;

CREATE FUNCTION public.xiv_research_bridge_apply(
  p_bridge_id uuid, p_token text, p_task_id uuid, p_expected_version integer,
  p_action text, p_payload jsonb
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog
AS $function$
DECLARE
  v_bridge xiv_private.research_bridges%ROWTYPE;
  v_payload jsonb := p_payload;
  v_task jsonb;
BEGIN
  v_bridge := xiv_private.research_capability(p_bridge_id, p_token);
  IF p_action IS NULL OR p_action NOT IN ('claim', 'renew', 'complete', 'block') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Research action is unavailable.';
  END IF;
  IF p_action = 'claim' THEN
    IF p_payload IS DISTINCT FROM '{}'::jsonb THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid research claim fields.';
    END IF;
    v_payload := jsonb_build_object('worker_session', v_bridge.session);
  END IF;
  v_task := xiv_private.research_apply(v_bridge.owner_id, v_bridge.id, v_bridge.expires_at,
    p_task_id, p_expected_version, p_action, v_payload);
  UPDATE xiv_private.research_bridges SET last_seen_at = clock_timestamp()
    WHERE owner_id = v_bridge.owner_id AND id = v_bridge.id;
  RETURN v_task;
END;
$function$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA xiv_private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.xiv_research_apply(uuid, integer, text, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.xiv_research_apply(uuid, integer, text, jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.xiv_research_bridge_register(uuid, text, text, timestamptz),
  public.xiv_research_bridge_revoke(uuid), public.xiv_research_bridge_list(),
  public.xiv_research_bridge_read(uuid, text, uuid),
  public.xiv_research_bridge_apply(uuid, text, uuid, integer, text, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.xiv_research_bridge_register(uuid, text, text, timestamptz),
  public.xiv_research_bridge_revoke(uuid), public.xiv_research_bridge_list() TO authenticated;
GRANT EXECUTE ON FUNCTION public.xiv_research_bridge_read(uuid, text, uuid),
  public.xiv_research_bridge_apply(uuid, text, uuid, integer, text, jsonb) TO anon, authenticated;

COMMIT;
