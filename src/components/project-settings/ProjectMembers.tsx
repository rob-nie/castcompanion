
import { useProjectMembers } from "@/hooks/useProjectMembers";
import { AddMemberForm } from "../project/AddMemberForm";
import { MembersList } from "../project/MembersList";

interface ProjectMembersProps {
  projectId: string;
  isOwner: boolean;
}

export const ProjectMembers = ({ projectId, isOwner }: ProjectMembersProps) => {
  const { members, isLoading, addMember } = useProjectMembers(projectId);

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
        <MembersList members={members} />
      </div>
    </div>
  );
};
