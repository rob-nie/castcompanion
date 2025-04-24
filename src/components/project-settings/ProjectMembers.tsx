
import { useProjectMembers } from "@/hooks/useProjectMembers";
import { AddMemberForm } from "../project/AddMemberForm";
import { MembersList } from "../project/MembersList";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProjectMembersProps {
  projectId: string;
  isOwner: boolean;
}

export const ProjectMembers = ({ projectId, isOwner }: ProjectMembersProps) => {
  const { members, isLoading, addMember, refreshMembers } = useProjectMembers(projectId);

  const handleDeleteMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast.success("Mitglied erfolgreich entfernt");
      refreshMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Fehler beim Entfernen des Mitglieds");
    }
  };

  return (
    <div className="space-y-4">
      {isOwner && (
        <div>
          <label className="block text-sm font-medium text-[#0A1915] dark:text-white mb-2">
            Mitglieder hinzufügen
          </label>
          <AddMemberForm onAdd={addMember} isSubmitting={isLoading} />
        </div>
      )}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#0A1915] dark:text-white">
          Projektmitglieder
        </label>
        <MembersList 
          members={members} 
          isOwner={isOwner} 
          onDeleteMember={isOwner ? handleDeleteMember : undefined} 
        />
      </div>
    </div>
  );
};
