-- Private desk storage only. Membership UUIDs are provisioned separately.
-- This migration never imports local notes, Gold data, or trading records.
BEGIN;

CREATE TABLE public.xiv_desk_members (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  enabled boolean NOT NULL DEFAULT true
);

CREATE TABLE public.xiv_desk_days (
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  day date NOT NULL CHECK (day BETWEEN DATE '0001-01-01' AND DATE '9999-12-31'),
  revision integer NOT NULL CHECK (revision BETWEEN 1 AND 1000000000),
  state jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_id, day)
);

CREATE TABLE public.xiv_desk_versions (
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  day date NOT NULL CHECK (day BETWEEN DATE '0001-01-01' AND DATE '9999-12-31'),
  revision integer NOT NULL CHECK (revision BETWEEN 1 AND 1000000000),
  state jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_id, day, revision)
);

CREATE TABLE public.xiv_desk_reports (
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  id text NOT NULL CHECK (id ~ '^[0-9a-f]{64}$'),
  role text NOT NULL CHECK (role = 'Research Analyst'),
  body jsonb NOT NULL CHECK (jsonb_typeof(body) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_id, id)
);

ALTER TABLE public.xiv_desk_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xiv_desk_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xiv_desk_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xiv_desk_reports ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.xiv_desk_members, public.xiv_desk_days,
  public.xiv_desk_versions, public.xiv_desk_reports FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.xiv_desk_members, public.xiv_desk_days,
  public.xiv_desk_versions, public.xiv_desk_reports TO authenticated;
GRANT INSERT ON public.xiv_desk_reports TO authenticated;

CREATE POLICY xiv_desk_members_read_self ON public.xiv_desk_members
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE POLICY xiv_desk_days_read_owner ON public.xiv_desk_days
  FOR SELECT TO authenticated USING (
    owner_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM public.xiv_desk_members AS m
      WHERE m.user_id = (SELECT auth.uid()) AND m.enabled
    )
  );

CREATE POLICY xiv_desk_versions_read_owner ON public.xiv_desk_versions
  FOR SELECT TO authenticated USING (
    owner_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM public.xiv_desk_members AS m
      WHERE m.user_id = (SELECT auth.uid()) AND m.enabled
    )
  );

CREATE POLICY xiv_desk_reports_read_owner ON public.xiv_desk_reports
  FOR SELECT TO authenticated USING (
    owner_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM public.xiv_desk_members AS m
      WHERE m.user_id = (SELECT auth.uid()) AND m.enabled
    )
  );

CREATE POLICY xiv_desk_reports_insert_owner ON public.xiv_desk_reports
  FOR INSERT TO authenticated WITH CHECK (
    owner_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM public.xiv_desk_members AS m
      WHERE m.user_id = (SELECT auth.uid()) AND m.enabled
    )
  );

CREATE FUNCTION public.xiv_desk_save(p_day date, p_revision integer, p_state jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
DECLARE
  v_owner uuid := auth.uid();
  v_enabled boolean;
  v_current integer;
  v_card jsonb;
  v_position jsonb;
  v_coordinate jsonb;
  v_number numeric;
  v_key text;
  v_id text;
  v_ids text[] := ARRAY[]::text[];
  v_text_total integer;
BEGIN
  IF v_owner IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'An enabled desk member is required.';
  END IF;
  SELECT m.enabled INTO v_enabled FROM public.xiv_desk_members AS m
    WHERE m.user_id = v_owner FOR SHARE;
  IF v_enabled IS DISTINCT FROM true THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'An enabled desk member is required.';
  END IF;
  IF p_day IS NULL OR NOT isfinite(p_day)
     OR p_day NOT BETWEEN DATE '0001-01-01' AND DATE '9999-12-31'
     OR p_revision IS NULL OR p_revision < 0 OR p_revision > 1000000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'A valid day and nonnegative revision are required.';
  END IF;

  IF jsonb_typeof(p_state) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid desk state.';
  END IF;
  IF NOT (p_state ?& ARRAY['cards', 'layout', 'camera', 'capture'])
     OR p_state - ARRAY['cards', 'layout', 'camera', 'capture'] <> '{}'::jsonb
     OR jsonb_typeof(p_state->'cards') IS DISTINCT FROM 'array'
     OR jsonb_typeof(p_state->'capture') IS DISTINCT FROM 'string' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid desk state fields.';
  END IF;
  v_text_total := char_length(p_state->>'capture');
  IF jsonb_array_length(p_state->'cards') > 80 OR v_text_total > 20000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Desk capture limits exceeded.';
  END IF;

  FOR v_card IN SELECT value FROM jsonb_array_elements(p_state->'cards') LOOP
    IF jsonb_typeof(v_card) IS DISTINCT FROM 'object' THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid thought.';
    END IF;
    IF NOT (v_card ?& ARRAY['id', 'raw', 'source', 'filename', 'position'])
       OR v_card - ARRAY['id', 'raw', 'source', 'filename', 'position'] <> '{}'::jsonb
       OR jsonb_typeof(v_card->'id') IS DISTINCT FROM 'string'
       OR jsonb_typeof(v_card->'raw') IS DISTINCT FROM 'string'
       OR jsonb_typeof(v_card->'source') IS DISTINCT FROM 'string'
       OR jsonb_typeof(v_card->'position') IS DISTINCT FROM 'array' THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid thought fields.';
    END IF;
    v_id := v_card->>'id';
    IF v_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       OR v_id = ANY(v_ids)
       OR char_length(v_card->>'raw') > 20000
       OR v_card->>'source' NOT IN ('typed', 'voice', 'drop') THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid thought identity or text.';
    END IF;
    v_ids := array_append(v_ids, v_id);
    IF v_card->'filename' <> 'null'::jsonb THEN
      IF jsonb_typeof(v_card->'filename') IS DISTINCT FROM 'string'
         OR char_length(v_card->>'filename') > 250 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid source filename.';
      END IF;
    END IF;
    v_text_total := v_text_total + char_length(v_card->>'raw');
    IF v_text_total > 200000 THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Total thought text limit exceeded.';
    END IF;
    v_position := v_card->'position';
    IF jsonb_array_length(v_position) <> 3 THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid thought position.';
    END IF;
    FOR v_coordinate IN SELECT value FROM jsonb_array_elements(v_position) LOOP
      IF jsonb_typeof(v_coordinate) IS DISTINCT FROM 'number' THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid spatial coordinate.';
      END IF;
      v_number := (v_coordinate #>> '{}')::numeric;
      IF v_number NOT BETWEEN -1600 AND 1600 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid spatial coordinate.';
      END IF;
    END LOOP;
  END LOOP;

  IF jsonb_typeof(p_state->'layout') IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid desk layout.';
  END IF;
  IF NOT ((p_state->'layout') ?& ARRAY['analyst', 'quant', 'coach'])
     OR (p_state->'layout') - ARRAY['analyst', 'quant', 'coach'] <> '{}'::jsonb THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid desk layout fields.';
  END IF;
  FOR v_position IN SELECT value FROM jsonb_each(p_state->'layout') LOOP
    IF jsonb_typeof(v_position) IS DISTINCT FROM 'array' THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid role position.';
    END IF;
    IF jsonb_array_length(v_position) <> 3 THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid role position.';
    END IF;
    FOR v_coordinate IN SELECT value FROM jsonb_array_elements(v_position) LOOP
      IF jsonb_typeof(v_coordinate) IS DISTINCT FROM 'number' THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid spatial coordinate.';
      END IF;
      v_number := (v_coordinate #>> '{}')::numeric;
      IF v_number NOT BETWEEN -1600 AND 1600 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid spatial coordinate.';
      END IF;
    END LOOP;
  END LOOP;

  IF jsonb_typeof(p_state->'camera') IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid camera.';
  END IF;
  IF NOT ((p_state->'camera') ?& ARRAY['rx', 'ry', 'zoom'])
     OR (p_state->'camera') - ARRAY['rx', 'ry', 'zoom'] <> '{}'::jsonb THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid camera fields.';
  END IF;
  FOREACH v_key IN ARRAY ARRAY['rx', 'ry', 'zoom'] LOOP
    v_coordinate := p_state->'camera'->v_key;
    IF jsonb_typeof(v_coordinate) IS DISTINCT FROM 'number' THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid camera coordinate.';
    END IF;
    v_number := (v_coordinate #>> '{}')::numeric;
    IF (v_key = 'zoom' AND v_number NOT BETWEEN 0.45 AND 1.4)
       OR (v_key <> 'zoom' AND v_number NOT BETWEEN -35 AND 35) THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid camera coordinate.';
    END IF;
  END LOOP;

  -- A hash collision only serializes unrelated saves; it cannot mix owners.
  PERFORM pg_advisory_xact_lock(hashtextextended(v_owner::text || ':' || to_char(p_day, 'YYYY-MM-DD'), 0));
  SELECT d.revision INTO v_current FROM public.xiv_desk_days AS d
    WHERE d.owner_id = v_owner AND d.day = p_day;
  v_current := coalesce(v_current, 0);
  IF v_current <> p_revision THEN
    RAISE EXCEPTION USING ERRCODE = '40001', MESSAGE = 'This day changed in another session. Reload before saving.';
  END IF;
  -- The final increment stays reloadable by clients with the same revision cap.
  IF v_current = 1000000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'The saved revision limit has been reached.';
  END IF;
  INSERT INTO public.xiv_desk_versions(owner_id, day, revision, state)
    VALUES (v_owner, p_day, v_current + 1, p_state);
  INSERT INTO public.xiv_desk_days(owner_id, day, revision, state)
    VALUES (v_owner, p_day, v_current + 1, p_state)
    ON CONFLICT (owner_id, day) DO UPDATE SET
      revision = EXCLUDED.revision, state = EXCLUDED.state, updated_at = now();
  RETURN jsonb_build_object('day', to_char(p_day, 'YYYY-MM-DD'),
    'revision', v_current + 1, 'state', p_state);
END;
$function$;

REVOKE ALL ON FUNCTION public.xiv_desk_save(date, integer, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.xiv_desk_save(date, integer, jsonb) TO authenticated;

COMMIT;
