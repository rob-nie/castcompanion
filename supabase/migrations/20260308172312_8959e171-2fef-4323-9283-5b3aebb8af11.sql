-- Avoid RLS recursion by using security definer helper
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_members pm
    WHERE pm.project_id = _project_id
      AND pm.user_id = _user_id
  );
$$;

-- Replace recursive policy on project_members
DROP POLICY IF EXISTS "Members can view project members" ON public.project_members;
CREATE POLICY "Members can view project members"
ON public.project_members
FOR SELECT
TO authenticated
USING (public.is_project_member(project_id, auth.uid()));

-- Keep related policies consistent and recursion-safe
DROP POLICY IF EXISTS "Project members can view projects" ON public.projects;
CREATE POLICY "Project members can view projects"
ON public.projects
FOR SELECT
TO authenticated
USING (public.is_project_member(id, auth.uid()));

DROP POLICY IF EXISTS "Project members can view messages" ON public.messages;
CREATE POLICY "Project members can view messages"
ON public.messages
FOR SELECT
TO authenticated
USING (public.is_project_member(project_id, auth.uid()));

DROP POLICY IF EXISTS "Project members can send messages" ON public.messages;
CREATE POLICY "Project members can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_project_member(project_id, auth.uid())
  AND auth.uid() = sender_id
);

DROP POLICY IF EXISTS "Project members can view timers" ON public.project_timers;
CREATE POLICY "Project members can view timers"
ON public.project_timers
FOR SELECT
TO authenticated
USING (public.is_project_member(project_id, auth.uid()));

DROP POLICY IF EXISTS "Project members can create timers" ON public.project_timers;
CREATE POLICY "Project members can create timers"
ON public.project_timers
FOR INSERT
TO authenticated
WITH CHECK (public.is_project_member(project_id, auth.uid()));

DROP POLICY IF EXISTS "Project members can update timers" ON public.project_timers;
CREATE POLICY "Project members can update timers"
ON public.project_timers
FOR UPDATE
TO authenticated
USING (public.is_project_member(project_id, auth.uid()));

DROP POLICY IF EXISTS "Project members can delete timers" ON public.project_timers;
CREATE POLICY "Project members can delete timers"
ON public.project_timers
FOR DELETE
TO authenticated
USING (public.is_project_member(project_id, auth.uid()));