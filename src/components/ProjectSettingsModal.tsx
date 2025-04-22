
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Trash2, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Tables } from "@/integrations/supabase/types";
import { useProjectMembers } from "@/hooks/useProjectMembers";
import { MembersList } from "./project/MembersList";
import { AddMemberForm } from "./project/AddMemberForm";

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
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { members, isLoading, addMember } = useProjectMembers(project.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          title,
          description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id);

      if (error) throw error;

      toast.success("Projekt erfolgreich aktualisiert");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Fehler beim Aktualisieren des Projekts");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveProject = async () => {
    if (!window.confirm("Möchten Sie dieses Projekt wirklich verlassen?")) return;

    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Möchten Sie dieses Projekt wirklich löschen?")) return;

    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Projekt Einstellungen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {isOwner && (
            <>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-[#0A1915] dark:text-white mb-2"
                >
                  Titel
                </label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-[#0A1915] dark:text-white mb-2"
                >
                  Beschreibung
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-[10px] border border-[#7A9992] bg-transparent p-2 min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A1915] dark:text-white mb-2">
                  Mitglieder hinzufügen
                </label>
                <AddMemberForm onAdd={addMember} isSubmitting={isSubmitting} />
              </div>
            </>
          )}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#0A1915] dark:text-white">
              Projektmitglieder
            </label>
            <MembersList members={members} />
          </div>
          <div className="flex justify-between">
            {isOwner ? (
              <Button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Löschen
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleLeaveProject}
                disabled={isSubmitting}
                className="bg-red-500 hover:bg-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Projekt verlassen
              </Button>
            )}
            <div className="space-x-2">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="border-[#7A9992] text-[#7A9992]"
              >
                Abbrechen
              </Button>
              {isOwner && (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#14A090] hover:bg-[#14A090]/90"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Speichern
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
