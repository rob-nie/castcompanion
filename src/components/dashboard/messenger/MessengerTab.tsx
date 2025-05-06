
import type { Tables } from "@/integrations/supabase/types";
import { MessengerView } from "./MessengerView";

interface MessengerTabProps {
  project: Tables<"projects">;
}

export const MessengerTab = ({ project }: MessengerTabProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <MessengerView project={project} />
      </div>
    </div>
  );
};
