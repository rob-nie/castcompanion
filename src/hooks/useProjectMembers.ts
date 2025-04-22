
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Member {
  id: string;
  email: string | null;
  role: string;
}

export const useProjectMembers = (projectId: string) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjectMembers = async () => {
    setIsLoading(true);
    try {
      // First, get the project members with their user_ids
      const { data: membersData, error: membersError } = await supabase
        .from("project_members")
        .select(`
          id,
          role,
          user_id
        `)
        .eq("project_id", projectId);

      if (membersError) {
        console.error("Error fetching project members:", membersError);
        return;
      }

      // Create an array to store the members with their emails
      const membersWithEmails: Member[] = [];

      // For each member, fetch the profile email separately
      for (const member of membersData) {
        if (member.user_id) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", member.user_id)
            .single();

          membersWithEmails.push({
            id: member.id,
            email: profileError ? null : profileData?.email || null,
            role: member.role,
          });
        } else {
          membersWithEmails.push({
            id: member.id,
            email: null,
            role: member.role,
          });
        }
      }

      setMembers(membersWithEmails);
    } catch (error) {
      console.error("Error in fetchProjectMembers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMember = async (email: string) => {
    setIsLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (userError || !userData) {
        toast.error("Benutzer nicht gefunden");
        return false;
      }

      const { error: memberError } = await supabase
        .from("project_members")
        .insert({
          project_id: projectId,
          user_id: userData.id,
          role: "member",
        });

      if (memberError) {
        if (memberError.code === '23505') {
          toast.error("Benutzer ist bereits Mitglied des Projekts");
        } else {
          throw memberError;
        }
        return false;
      }

      toast.success("Mitglied erfolgreich hinzugefügt");
      await fetchProjectMembers();
      return true;
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Fehler beim Hinzufügen des Mitglieds");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectMembers();
    }
  }, [projectId]);

  return {
    members,
    isLoading,
    addMember,
    refreshMembers: fetchProjectMembers
  };
};
