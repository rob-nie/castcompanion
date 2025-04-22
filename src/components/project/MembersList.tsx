
interface Member {
  id: string;
  email: string | null;
  role: string;
}

interface MembersListProps {
  members: Member[];
}

export const MembersList = ({ members }: MembersListProps) => {
  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-2 rounded-[10px] border border-[#7A9992]"
        >
          <span>{member.email || 'Unbekannt'}</span>
          <span className="text-sm text-[#7A9992]">{member.role}</span>
        </div>
      ))}
    </div>
  );
};
