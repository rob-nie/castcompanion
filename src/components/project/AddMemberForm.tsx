
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus2 } from "lucide-react";

interface AddMemberFormProps {
  onAdd: (email: string) => Promise<boolean>;
  isSubmitting: boolean;
}

export const AddMemberForm = ({ onAdd, isSubmitting }: AddMemberFormProps) => {
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail) return;

    const success = await onAdd(newMemberEmail);
    if (success) {
      setNewMemberEmail("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        value={newMemberEmail}
        onChange={(e) => setNewMemberEmail(e.target.value)}
        placeholder="E-Mail-Adresse"
        className="flex-1"
      />
      <Button
        type="submit"
        disabled={isSubmitting || !newMemberEmail}
        className="bg-[#14A090] hover:bg-[#14A090]/90"
      >
        <UserPlus2 className="h-4 w-4" />
      </Button>
    </form>
  );
};
