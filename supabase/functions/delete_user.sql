
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  requesting_user_id uuid;
BEGIN
  -- Get the ID of the requesting user
  requesting_user_id := auth.uid();
  
  -- Delete the user's profile
  DELETE FROM public.profiles WHERE id = requesting_user_id;
  
  -- Delete the user from auth.users
  DELETE FROM auth.users WHERE id = requesting_user_id;
END;
$$;
