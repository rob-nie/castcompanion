
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

interface ProjectSettingsModalProps {
  project: Tables<"projects">;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProjectSettingsModal = ({
  project,
  isOpen,
  onClose,
  onSuccess,
}: ProjectSettingsModalProps) => {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-[#0A1915] dark:text-white mb-2"
            >
              Titel
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-[10px] border border-[#7A9992] bg-transparent p-2"
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
          <div className="flex justify-between">
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Löschen
            </Button>
            <div className="space-x-2">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="border-[#7A9992] text-[#7A9992]"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#14A090] hover:bg-[#14A090]/90"
              >
                <Settings className="mr-2 h-4 w-4" />
                Speichern
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
