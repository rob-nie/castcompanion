
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
        const { data, error } = await supabase.rpc('is_project_member', {
          project_id: projectId,
          user_id: user.id
        });
        
        if (error) {
          console.error('RPC error while checking project membership:', error);
          toast.error('Fehler bei der Überprüfung der Projektmitgliedschaft');
          setIsProjectMember(false);
          return;
        }

console.log(`User membership check result: ${data ? 'true' : 'false'}`);  
setIsProjectMember(data); // true oder false
        
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
