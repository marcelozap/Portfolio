-- Offline foundation only: no worker, provider, scheduler, or outbound connection.
-- Apply after 202609080001_xiv_private_desk.sql. Membership is provisioned separately.
BEGIN;

CREATE TABLE public.xiv_research_tasks (
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  id uuid NOT NULL,
  question text NOT NULL CHECK (char_length(question) BETWEEN 1 AND 12000 AND question ~ '[^[:space:]]'),
  scope text NOT NULL CHECK (scope = 'public_primary_sources'),
  role text NOT NULL CHECK (role = 'research_analyst'),
  version integer NOT NULL CHECK (version BETWEEN 1 AND 1000000000),
  status text NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'blocked', 'cancelled')),
  created_at timestamptz NOT NULL CHECK (isfinite(created_at)),
  updated_at timestamptz NOT NULL CHECK (isfinite(updated_at)),
  worker_session text CHECK (worker_session ~ '^(codex|claude):[A-Za-z0-9_-]{8,128}$'),
  claim_id uuid,
  claimed_at timestamptz CHECK (isfinite(claimed_at)),
  lease_expires_at timestamptz CHECK (isfinite(lease_expires_at)),
  completed_at timestamptz CHECK (isfinite(completed_at)),
  result jsonb CHECK (jsonb_typeof(result) = 'object' AND octet_length(result::text) <= 100000),
  blocked_reason text CHECK (char_length(blocked_reason) BETWEEN 1 AND 4000 AND blocked_reason ~ '[^[:space:]]'),
  cancel_reason text CHECK (char_length(cancel_reason) BETWEEN 1 AND 4000 AND cancel_reason ~ '[^[:space:]]'),
  PRIMARY KEY (owner_id, id),
  CHECK ((worker_session IS NULL AND claim_id IS NULL AND claimed_at IS NULL)
    OR (worker_session IS NOT NULL AND claim_id IS NOT NULL AND claimed_at IS NOT NULL)),
  CHECK ((status = 'running' AND lease_expires_at IS NOT NULL AND claim_id IS NOT NULL)
    OR (status <> 'running' AND lease_expires_at IS NULL)),
  CHECK (status <> 'queued' OR claim_id IS NULL),
  CHECK ((status = 'completed' AND result IS NOT NULL AND completed_at IS NOT NULL AND claim_id IS NOT NULL)
    OR (status <> 'completed' AND result IS NULL AND completed_at IS NULL)),
  CHECK ((status = 'blocked' AND blocked_reason IS NOT NULL AND claim_id IS NOT NULL)
    OR (status <> 'blocked' AND blocked_reason IS NULL)),
  CHECK ((status = 'cancelled' AND cancel_reason IS NOT NULL)
    OR (status <> 'cancelled' AND cancel_reason IS NULL))
);

CREATE TABLE public.xiv_research_events (
  owner_id uuid NOT NULL,
  task_id uuid NOT NULL,
  version integer NOT NULL CHECK (version BETWEEN 1 AND 1000000000),
  action text NOT NULL CHECK (action IN ('create', 'claim', 'renew', 'complete', 'block', 'cancel', 'retry')),
  occurred_at timestamptz NOT NULL CHECK (isfinite(occurred_at)),
  snapshot jsonb NOT NULL CHECK (jsonb_typeof(snapshot) = 'object'),
  PRIMARY KEY (owner_id, task_id, version),
  FOREIGN KEY (owner_id, task_id) REFERENCES public.xiv_research_tasks(owner_id, id)
);

ALTER TABLE public.xiv_research_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xiv_research_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.xiv_research_tasks, public.xiv_research_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.xiv_research_tasks, public.xiv_research_events TO authenticated;

CREATE POLICY xiv_research_tasks_read_owner ON public.xiv_research_tasks
  FOR SELECT TO authenticated USING (
    owner_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM public.xiv_desk_members AS m
      WHERE m.user_id = (SELECT auth.uid()) AND m.enabled
    )
  );

CREATE POLICY xiv_research_events_read_owner ON public.xiv_research_events
  FOR SELECT TO authenticated USING (
    owner_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM public.xiv_desk_members AS m
      WHERE m.user_id = (SELECT auth.uid()) AND m.enabled
    )
  );

CREATE FUNCTION public.xiv_research_apply(
  p_task_id uuid, p_expected_version integer, p_action text, p_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
DECLARE
  v_owner uuid := auth.uid();
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
    -- This is asserted provenance, not proof of an agent identity. No bridge is connected.
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
      RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Research task is unavailable.';
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
        v_task.claim_id := gen_random_uuid();
        v_task.claimed_at := v_now;
        v_task.lease_expires_at := v_now + interval '15 minutes';
      WHEN 'renew' THEN
        v_task.lease_expires_at := v_now + interval '15 minutes';
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

REVOKE ALL ON FUNCTION public.xiv_research_apply(uuid, integer, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.xiv_research_apply(uuid, integer, text, jsonb) TO authenticated;

COMMIT;
