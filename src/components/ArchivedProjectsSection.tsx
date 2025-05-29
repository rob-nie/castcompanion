
import { useState } from "react";
import { ChevronDown, ChevronUp, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ProjectCard } from "./ProjectCard";
import type { Tables } from "@/integrations/supabase/types";

interface ProjectWithArchiveStatus extends Tables<"projects"> {
  is_archived?: boolean;
}

interface ArchivedProjectsSectionProps {
  archivedProjects: ProjectWithArchiveStatus[];
  onUpdate: () => void;
}

export const ArchivedProjectsSection = ({ 
  archivedProjects, 
  onUpdate 
}: ArchivedProjectsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (archivedProjects.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-8">
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-[44px] rounded-[10px] border-[#7A9992] text-[#7A9992] dark:text-[#CCCCCC] hover:bg-[#7A9992]/10 justify-between"
        >
          <div className="flex items-center">
            <Archive className="mr-2 h-4 w-4" />
            Archivierte Projekte ({archivedProjects.length})
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {archivedProjects.map((project, index) => (
            <div 
              key={project.id} 
              className="scale-75 origin-top-left transform"
              style={{ 
                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s forwards` 
              }}
            >
              <ProjectCard 
                project={project} 
                onUpdate={onUpdate}
                isArchived={true}
              />
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
