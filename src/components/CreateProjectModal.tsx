
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthProvider";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!user) {
      toast.error("Du musst angemeldet sein, um ein Projekt zu erstellen.");
      setIsLoading(false);
      return;
    }

    try {
      // Check session again to make sure user is still authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.");
        setIsLoading(false);
        return;
      }
      
      // Insert project and get the project id
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert([{ 
          title, 
          description,
          user_id: user.id 
        }])
        .select('id')
        .single();

      if (projectError) {
        console.error("Error creating project:", projectError);
        toast.error(`Fehler beim Erstellen des Projekts: ${projectError.message}`);
        return;
      }
      
      // Add project owner to project_members
      const { error: memberError } = await supabase
        .from("project_members")
        .insert([{
          project_id: projectData.id,
          user_id: user.id,
          role: "owner"
        }]);

      if (memberError) {
        console.error("Error adding project member:", memberError);
        toast.error(`Fehler beim Hinzufügen als Projektbesitzer: ${memberError.message}`);
        return;
      }

      toast.success("Projekt erfolgreich erstellt");
      
      setTitle("");
      setDescription("");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error("Fehler beim Erstellen des Projekts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neues Projekt erstellen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Titel
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Projekttitel"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Beschreibung (optional)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Projektbeschreibung"
              className="h-32"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} className="border-[#7A9992] text-[#7A9992]">
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#14A090] hover:bg-[#14A090]/90">
              {isLoading ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
