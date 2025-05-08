
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";

interface Member {
  id: string;
  email: string | null;
  full_name: string | null;
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
          className="bg-background mb-2"
        >
          {/* Rolle oben */}
          <div className="text-[10px] text-[#7A9992] dark:text-[#CCCCCC] mb-1">
            {member.role}
          </div>

          {/* E-Mail und Lösch-Icon in einer Zeile */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-medium">
                {member.full_name || 'Unbenannter Nutzer'}
              </span>
              {member.email && (
                <div className="text-xs text-[#7A9992] dark:text-[#CCCCCC]">
                  {member.email}
                </div>
              )}
            </div>

            {/* Lösch-Button, nur wenn der Benutzer nicht "owner" ist */}
            {isOwner && onDeleteMember && member.role !== "owner" && (
              <Button
                variant="ghost"
                onClick={() => onDeleteMember(member.id)}
                className="p-0 h-auto w-auto text-[#7A9992] hover:text-red-500 hover:bg-transparent"
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
