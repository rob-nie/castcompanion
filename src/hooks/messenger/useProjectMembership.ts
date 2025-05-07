
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export const useProjectMembership = (projectId: string, user: User | null) => {
  const [isProjectMember, setIsProjectMember] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMembership = async () => {
      if (!user?.id || !projectId) {
        setIsProjectMember(false);
        return;
      }

      try {
        console.log(`Checking membership for user ${user.id} in project ${projectId}`);
        
        // Check if user is member of this project
        const { data, error } = await supabase
          .from('project_members')
          .select('id, role')
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error('Error checking project membership:', error);
          toast.error('Fehler bei der Überprüfung der Projektmitgliedschaft');
          setIsProjectMember(false);
          return;
        }
        
        const isMember = !!data;
        console.log(`User membership check result: ${isMember ? 'true' : 'false'} (${data ? data.role : 'not a member'})`);
        setIsProjectMember(isMember);
      } catch (error) {
        console.error('Exception in membership check:', error);
        setIsProjectMember(false);
      }
    };

    checkMembership();
  }, [projectId, user?.id]);

  return { isProjectMember };
};
