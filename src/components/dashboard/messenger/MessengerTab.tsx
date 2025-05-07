
import type { Tables } from "@/integrations/supabase/types";

interface MessengerTabProps {
  project: Tables<"projects">;
}

export const MessengerTab = ({ project }: MessengerTabProps) => {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-medium mb-4">Messenger</h2>
      <p className="text-[#7A9992] dark:text-[#CCCCCC]">Coming soon...</p>
    </div>
  );
};
