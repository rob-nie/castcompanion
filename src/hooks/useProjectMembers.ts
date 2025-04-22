
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
    const { data: membersData, error } = await supabase
      .from("project_members")
      .select(`
        id,
        role,
        user_id,
        profiles (email)
      `)
      .eq("project_id", projectId);

    if (error) {
      console.error("Error fetching project members:", error);
      return;
    }

    const transformedMembers = membersData.map(member => ({
      id: member.id,
      email: member.profiles?.email || null,
      role: member.role
    }));

    setMembers(transformedMembers);
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
    fetchProjectMembers();
  }, [projectId]);

  return {
    members,
    isLoading,
    addMember,
    refreshMembers: fetchProjectMembers
  };
};
