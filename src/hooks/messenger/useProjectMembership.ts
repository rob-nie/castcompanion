
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export const useProjectMembership = (projectId: string, user: User | null) => {
  const [isProjectMember, setIsProjectMembership] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMembership = async () => {
      if (!user?.id || !projectId) {
        setIsProjectMembership(false);
        return;
      }

      try {
        console.log(`Checking membership for user ${user.id} in project ${projectId}`);
        
        // Check if user is member of this project using the RPC function
        const { data, error } = await supabase.rpc('is_project_member', {
          project_id: projectId,
          user_id: user.id
        });
        
        if (error) {
          console.error('RPC error while checking project membership:', error);
          toast.error('Fehler bei der Überprüfung der Projektmitgliedschaft');
          setIsProjectMembership(false);
          return;
        }

        console.log(`User membership check result: ${data ? 'true' : 'false'}`);
        setIsProjectMembership(data);
        
      } catch (error) {
        console.error('Exception in membership check:', error);
        setIsProjectMembership(false);
      }
    };

    checkMembership();
  }, [projectId, user?.id]);

  return { isProjectMember: isProjectMembership };
};
