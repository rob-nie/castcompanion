
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { EditProjectForm } from "./EditProjectForm";
import { ProjectMembers } from "./ProjectMembers";

interface ProjectSettingsModalProps {
  project: Tables<"projects">;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isOwner: boolean;
}

export const ProjectSettingsModal = ({
  project,
  isOpen,
  onClose,
  onSuccess,
  isOwner,
}: ProjectSettingsModalProps) => {
  const handleLeaveProject = async () => {
    if (!window.confirm("Möchten Sie dieses Projekt wirklich verlassen?")) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Nicht authentifiziert");
        return;
      }

      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("project_id", project.id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Projekt erfolgreich verlassen");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error leaving project:", error);
      toast.error("Fehler beim Verlassen des Projekts");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Möchten Sie dieses Projekt wirklich löschen?")) return;

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);

      if (error) throw error;

      toast.success("Projekt erfolgreich gelöscht");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Fehler beim Löschen des Projekts");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Projekt Einstellungen</DialogTitle>
        </DialogHeader>

        {isOwner && <EditProjectForm project={project} onSuccess={onSuccess} onClose={onClose} />}

        <ProjectMembers projectId={project.id} isOwner={isOwner} />

        <div className="flex justify-between pt-4">
          {isOwner ? (
            <Button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Löschen
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleLeaveProject}
              className="bg-red-500 hover:bg-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Projekt verlassen
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
