
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface EditProjectFormProps {
  project: Tables<"projects">;
  onSuccess: () => void;
  onClose: () => void;
}

export const EditProjectForm = ({ project, onSuccess, onClose }: EditProjectFormProps) => {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[#0A1915] dark:text-white mb-2">
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
        <label htmlFor="description" className="block text-sm font-medium text-[#0A1915] dark:text-white mb-2">
          Beschreibung
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-[10px] border border-[#7A9992] bg-transparent p-2 min-h-[100px]"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" onClick={onClose} variant="outline" className="border-[#7A9992] text-[#7A9992]">
          Abbrechen
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-[#14A090] hover:bg-[#14A090]/90">
          <Settings className="mr-2 h-4 w-4" />
          Speichern
        </Button>
      </div>
    </form>
  );
};
