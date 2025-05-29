
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProjectSearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ProjectSearchInput = ({ 
  searchTerm, 
  onSearchChange
}: ProjectSearchInputProps) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7A9992] dark:text-[#CCCCCC] h-4 w-4" />
      <Input
        type="text"
        placeholder="Projekte durchsuchen..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 h-[44px] rounded-[10px] border-[#7A9992] bg-transparent"
      />
    </div>
  );
};
