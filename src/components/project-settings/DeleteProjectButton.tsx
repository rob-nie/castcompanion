
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteProjectButtonProps {
  projectId: string;
  onSuccess: () => void;
}

export const DeleteProjectButton = ({ projectId, onSuccess }: DeleteProjectButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // First, get all message IDs for this project
      const { data: messages, error: messagesQueryError } = await supabase
        .from("messages")
        .select("id")
        .eq("project_id", projectId);
      
      if (messagesQueryError) {
        console.error("Error fetching message IDs:", messagesQueryError);
        throw messagesQueryError;
      }
      
      // If there are messages, delete their read status entries
      if (messages && messages.length > 0) {
        const messageIds = messages.map(msg => msg.id);
        const { error: readStatusError } = await supabase
          .from("message_read_status")
          .delete()
          .in("message_id", messageIds);
        
        if (readStatusError) {
          console.error("Error deleting message read status:", readStatusError);
          throw readStatusError;
        }
      }
      
      // Then, delete all messages associated with the project
      const { error: messagesError } = await supabase
        .from("messages")
        .delete()
        .eq("project_id", projectId);
      
      if (messagesError) {
        console.error("Error deleting project messages:", messagesError);
        throw messagesError;
      }
      
      // Delete all live notes associated with the project
      const { error: liveNotesError } = await supabase
        .from("live_notes")
        .delete()
        .eq("project_id", projectId);

      if (liveNotesError) {
        console.error("Error deleting project live notes:", liveNotesError);
        throw liveNotesError;
      }
      
      // Delete interview notes associated with the project
      const { error: interviewNotesError } = await supabase
        .from("interview_notes")
        .delete()
        .eq("project_id", projectId);
        
      if (interviewNotesError) {
        console.error("Error deleting project interview notes:", interviewNotesError);
        throw interviewNotesError;
      }
      
      // Delete project timers associated with the project
      const { error: timersError } = await supabase
        .from("project_timers")
        .delete()
        .eq("project_id", projectId);

      if (timersError) {
        console.error("Error deleting project timers:", timersError);
        throw timersError;
      }
      
      // Delete all project members
      const { error: membersError } = await supabase
        .from("project_members")
        .delete()
        .eq("project_id", projectId);

      if (membersError) {
        console.error("Error deleting project members:", membersError);
        throw membersError;
      }
      
      // Finally delete the project itself
      const { error: projectError } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (projectError) {
        console.error("Error deleting project:", projectError);
        throw projectError;
      }

      toast.success("Projekt erfolgreich gelöscht");
      onSuccess();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Fehler beim Löschen des Projekts");
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        className="bg-red-500 hover:bg-red-600"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Löschen
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Projekt löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie dieses Projekt wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
              Alle Mitglieder, Nachrichten und Notizen des Projekts werden dabei ebenfalls gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Wird gelöscht..." : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
