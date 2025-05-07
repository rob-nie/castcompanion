
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";

export const useProjectMembership = (projectId: string) => {
  const { user } = useAuth();
  const [isProjectMember, setIsProjectMember] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMembership = async () => {
      if (!projectId || !user) {
        setIsProjectMember(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('is_project_member', { 
            project_id: projectId, 
            user_id: user.id 
          });

        if (error) {
          console.error("Error checking project membership:", error);
          setIsProjectMember(false);
        } else {
          setIsProjectMember(!!data);
        }
      } catch (err) {
        console.error("Exception in checkMembership:", err);
        setIsProjectMember(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkMembership();
  }, [projectId, user]);

  return { isProjectMember, isLoading };
};
