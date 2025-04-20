
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

interface ProjectSettingsModalProps {
  project: Tables<"projects">;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

export function ProjectSettingsModal({ 
  project, 
  isOpen, 
  onClose, 
  onUpdate,
  onDelete 
}: ProjectSettingsModalProps) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || "");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase
      .from("projects")
      .update({ 
        title, 
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', project.id);

    setIsLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Projekt konnte nicht aktualisiert werden."
      });
      return;
    }

    toast({
      title: "Projekt aktualisiert",
      description: "Die Projekteinstellungen wurden erfolgreich aktualisiert."
    });
    
    onUpdate();
    onClose();
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq('id', project.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Projekt konnte nicht gelöscht werden."
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Projekt gelöscht",
        description: "Das Projekt wurde erfolgreich gelöscht."
      });
      
      // Erst onDelete aufrufen und dann Dialoge schließen
      onDelete();
      setShowDeleteDialog(false);
      onClose();
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Projekteinstellungen</DialogTitle>
            <DialogDescription>
              Hier können Sie die Einstellungen Ihres Projekts bearbeiten.
            </DialogDescription>
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
                Beschreibung
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Projektbeschreibung"
                className="h-32"
              />
            </div>
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isLoading}
              >
                Projekt löschen
              </Button>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Wird gespeichert..." : "Speichern"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={showDeleteDialog} 
        onOpenChange={(open) => {
          if (!open && !isLoading) setShowDeleteDialog(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Projekt löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Das Projekt wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Wird gelöscht..." : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
