
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
      console.log("Starting project deletion for:", projectId);
      
      // Step 1: Delete message read status entries first
      console.log("Deleting message read status entries...");
      const { data: messages, error: messagesQueryError } = await supabase
        .from("messages")
        .select("id")
        .eq("project_id", projectId);
      
      if (messagesQueryError) {
        console.error("Error fetching message IDs:", messagesQueryError);
        throw messagesQueryError;
      }
      
      if (messages && messages.length > 0) {
        const messageIds = messages.map(msg => msg.id);
        console.log("Found messages to clean up:", messageIds.length);
        
        const { error: readStatusError } = await supabase
          .from("message_read_status")
          .delete()
          .in("message_id", messageIds);
        
        if (readStatusError) {
          console.error("Error deleting message read status:", readStatusError);
          throw readStatusError;
        }
        console.log("Message read status entries deleted successfully");
      }
      
      // Step 2: Delete all messages
      console.log("Deleting messages...");
      const { error: messagesError } = await supabase
        .from("messages")
        .delete()
        .eq("project_id", projectId);
      
      if (messagesError) {
        console.error("Error deleting messages:", messagesError);
        throw messagesError;
      }
      console.log("Messages deleted successfully");
      
      // Step 3: Delete live notes
      console.log("Deleting live notes...");
      const { error: liveNotesError } = await supabase
        .from("live_notes")
        .delete()
        .eq("project_id", projectId);

      if (liveNotesError) {
        console.error("Error deleting live notes:", liveNotesError);
        throw liveNotesError;
      }
      console.log("Live notes deleted successfully");
      
      // Step 4: Delete interview notes
      console.log("Deleting interview notes...");
      const { error: interviewNotesError } = await supabase
        .from("interview_notes")
        .delete()
        .eq("project_id", projectId);
        
      if (interviewNotesError) {
        console.error("Error deleting interview notes:", interviewNotesError);
        throw interviewNotesError;
      }
      console.log("Interview notes deleted successfully");
      
      // Step 5: Delete project timers
      console.log("Deleting project timers...");
      const { error: timersError } = await supabase
        .from("project_timers")
        .delete()
        .eq("project_id", projectId);

      if (timersError) {
        console.error("Error deleting project timers:", timersError);
        throw timersError;
      }
      console.log("Project timers deleted successfully");
      
      // Step 6: Delete project members
      console.log("Deleting project members...");
      const { error: membersError } = await supabase
        .from("project_members")
        .delete()
        .eq("project_id", projectId);

      if (membersError) {
        console.error("Error deleting project members:", membersError);
        throw membersError;
      }
      console.log("Project members deleted successfully");
      
      // Step 7: Finally delete the project itself
      console.log("Deleting project...");
      const { error: projectError } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (projectError) {
        console.error("Error deleting project:", projectError);
        throw projectError;
      }
      console.log("Project deleted successfully");

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
