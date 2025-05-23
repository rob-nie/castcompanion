
import { useState } from "react";
import { LogOut } from "lucide-react";
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

interface LeaveProjectButtonProps {
  projectId: string;
  onSuccess: () => void;
}

export const LeaveProjectButton = ({ projectId, onSuccess }: LeaveProjectButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeaveProject = async () => {
    setIsLeaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Nicht authentifiziert");
        return;
      }

      // First, find the member entry for the current user
      const { data: memberData, error: findError } = await supabase
        .from("project_members")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .single();

      if (findError || !memberData) {
        console.error("Error finding project member:", findError);
        toast.error("Fehler beim Finden der Mitgliedschaft");
        return;
      }

      // Then delete the specific member entry by id
      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("id", memberData.id);

      if (error) throw error;

      toast.success("Projekt erfolgreich verlassen");
      onSuccess();
    } catch (error) {
      console.error("Error leaving project:", error);
      toast.error("Fehler beim Verlassen des Projekts");
    } finally {
      setIsLeaving(false);
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
        <LogOut className="mr-2 h-4 w-4" />
        Projekt verlassen
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Projekt verlassen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie dieses Projekt wirklich verlassen? Sie können dem Projekt später wieder beitreten, wenn Sie eingeladen werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLeaving}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveProject}
              disabled={isLeaving}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLeaving ? "Wird verlassen..." : "Verlassen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
