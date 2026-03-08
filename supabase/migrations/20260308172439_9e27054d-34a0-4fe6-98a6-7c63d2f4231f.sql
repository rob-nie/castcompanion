-- Allow project owners to see their own projects (needed for INSERT...RETURNING)
CREATE POLICY "Project owner can view own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (user_id = auth.uid());