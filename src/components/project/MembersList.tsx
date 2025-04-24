
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";

interface Member {
  id: string;
  email: string | null;
  role: string;
}

interface MembersListProps {
  members: Member[];
  isOwner: boolean;
  onDeleteMember?: (memberId: string) => void;
}

export const MembersList = ({ members, isOwner, onDeleteMember }: MembersListProps) => {
  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-2 rounded-[10px] border border-[#7A9992]"
        >
          <span>{member.email || 'Unbekannt'}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#7A9992] dark:text-[#CCCCCC]">{member.role}</span>
            {isOwner && onDeleteMember && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteMember(member.id)}
                className="text-[#7A9992] dark:text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950"
              >
                <UserX className="h-4 w-4" />
                <span className="sr-only">Mitglied entfernen</span>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
