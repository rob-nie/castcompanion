
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProjectArchive = () => {
  const [isLoading, setIsLoading] = useState(false);

  const toggleArchiveStatus = async (projectId: string, currentlyArchived: boolean) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Nicht authentifiziert");
        return false;
      }

      if (currentlyArchived) {
        // Remove from archives (unarchive)
        const { error } = await supabase
          .from("user_project_archives")
          .delete()
          .eq("user_id", user.id)
          .eq("project_id", projectId);

        if (error) throw error;
        toast.success("Projekt aus Archiv entfernt");
      } else {
        // Add to archives
        const { error } = await supabase
          .from("user_project_archives")
          .upsert({
            user_id: user.id,
            project_id: projectId,
            is_archived: true
          });

        if (error) throw error;
        toast.success("Projekt archiviert");
      }

      return true;
    } catch (error: any) {
      console.error("Error toggling archive status:", error);
      toast.error("Fehler beim Ändern des Archivstatus");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    toggleArchiveStatus,
    isLoading
  };
};
