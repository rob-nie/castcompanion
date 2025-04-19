
import type { Tables } from "@/integrations/supabase/types";

interface ProjectCardProps {
  project: Tables<"projects">;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <div 
      className="h-[150px] max-w-[414px] p-6 rounded-[20px] border border-[#CCCCCC] dark:border-[#5C6664] overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
      style={{
        background: 'linear-gradient(135deg, #14A090, #0A2550)',
        boxShadow: '0 5px 15px rgba(20, 160, 130, 0.5)',
      }}
    >
      <div className="text-white h-full flex flex-col">
        <h3 className="text-xl font-medium mb-2">{project.title}</h3>
        {project.description && (
          <p className="text-sm opacity-90 line-clamp-3">{project.description}</p>
        )}
      </div>
    </div>
  );
};
