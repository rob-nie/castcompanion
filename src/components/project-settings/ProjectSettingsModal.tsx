
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Tables } from "@/integrations/supabase/types";
import { EditProjectForm } from "./EditProjectForm";
import { ProjectMembers } from "./ProjectMembers";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { LeaveProjectButton } from "./LeaveProjectButton";
import { useEffect, useState } from "react";

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
  const [isVisible, setIsVisible] = useState(false);
  
  const handleActionSuccess = () => {
    onSuccess();
    onClose();
  };
  
  // Set visibility when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Add a small delay before actually closing to allow fade-out animation
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Projekt Einstellungen</DialogTitle>
          <DialogDescription>
            Verwalte die Einstellungen für dein Projekt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 transition-opacity duration-300" style={{ opacity: isVisible ? 1 : 0 }}>
          {isOwner && <EditProjectForm project={project} onSuccess={onSuccess} onClose={onClose} />}

          <Separator className="my-4 bg-cast-moss-gray/50 dark:bg-cast-silver-gray/50" />

          <ProjectMembers projectId={project.id} isOwner={isOwner} />

          <Separator className="my-4 bg-cast-moss-gray/50 dark:bg-cast-silver-gray/50" />

          <div className="flex justify-between pt-2">
            {isOwner ? (
              <DeleteProjectButton 
                projectId={project.id}
                onSuccess={handleActionSuccess}
              />
            ) : (
              <LeaveProjectButton 
                projectId={project.id}
                onSuccess={handleActionSuccess}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
