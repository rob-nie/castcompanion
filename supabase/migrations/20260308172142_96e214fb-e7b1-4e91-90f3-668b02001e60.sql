
-- 1. Create all tables first (no RLS policies yet)

CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.project_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.message_read_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

CREATE TABLE public.interview_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.live_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  time_marker INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.project_timers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  is_running BOOLEAN NOT NULL DEFAULT false,
  start_time TIMESTAMP WITH TIME ZONE,
  accumulated_time BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

CREATE TABLE public.quick_phrases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  "order" INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_project_archives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  is_archived BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- 2. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_project_archives ENABLE ROW LEVEL SECURITY;

-- 3. Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 4. Projects policies (now project_members exists)
CREATE POLICY "Project members can view projects" ON public.projects FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = id AND pm.user_id = auth.uid()));
CREATE POLICY "Authenticated users can create projects" ON public.projects FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Project owner can update" ON public.projects FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Project owner can delete" ON public.projects FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 5. Project members policies
CREATE POLICY "Members can view project members" ON public.project_members FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid()));
CREATE POLICY "Project owner can add members" ON public.project_members FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()) OR auth.uid() = user_id);
CREATE POLICY "Project owner can remove members" ON public.project_members FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()) OR user_id = auth.uid());

-- 6. Messages policies
CREATE POLICY "Project members can view messages" ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = messages.project_id AND pm.user_id = auth.uid()));
CREATE POLICY "Project members can send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = messages.project_id AND pm.user_id = auth.uid()) AND auth.uid() = sender_id);
CREATE POLICY "Message sender can delete" ON public.messages FOR DELETE TO authenticated
  USING (sender_id = auth.uid());

-- 7. Message read status policies
CREATE POLICY "Users can view their own read status" ON public.message_read_status FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can mark messages as read" ON public.message_read_status FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own read status" ON public.message_read_status FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 8. Interview notes policies
CREATE POLICY "Users can view their own interview notes" ON public.interview_notes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create interview notes" ON public.interview_notes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own interview notes" ON public.interview_notes FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own interview notes" ON public.interview_notes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 9. Live notes policies
CREATE POLICY "Users can view their own live notes" ON public.live_notes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create live notes" ON public.live_notes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own live notes" ON public.live_notes FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own live notes" ON public.live_notes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 10. Project timers policies
CREATE POLICY "Project members can view timers" ON public.project_timers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_timers.project_id AND pm.user_id = auth.uid()));
CREATE POLICY "Project members can create timers" ON public.project_timers FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_timers.project_id AND pm.user_id = auth.uid()));
CREATE POLICY "Project members can update timers" ON public.project_timers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_timers.project_id AND pm.user_id = auth.uid()));
CREATE POLICY "Project members can delete timers" ON public.project_timers FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_timers.project_id AND pm.user_id = auth.uid()));

-- 11. Push subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.push_subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create subscriptions" ON public.push_subscriptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own subscriptions" ON public.push_subscriptions FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update their own subscriptions" ON public.push_subscriptions FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- 12. Quick phrases policies
CREATE POLICY "Users can view their own phrases" ON public.quick_phrases FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create phrases" ON public.quick_phrases FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own phrases" ON public.quick_phrases FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own phrases" ON public.quick_phrases FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 13. User project archives policies
CREATE POLICY "Users can view their own archives" ON public.user_project_archives FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can archive projects" ON public.user_project_archives FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own archives" ON public.user_project_archives FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own archives" ON public.user_project_archives FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 14. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_interview_notes_updated_at BEFORE UPDATE ON public.interview_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_live_notes_updated_at BEFORE UPDATE ON public.live_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_timers_updated_at BEFORE UPDATE ON public.project_timers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quick_phrases_updated_at BEFORE UPDATE ON public.quick_phrases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 16. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_timers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_read_status;
