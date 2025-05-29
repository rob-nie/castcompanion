
import { Search, Archive, ArchiveX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProjectSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showArchived: boolean;
  onToggleArchived: () => void;
  archivedCount: number;
}

export const ProjectSearch = ({ 
  searchTerm, 
  onSearchChange, 
  showArchived, 
  onToggleArchived,
  archivedCount 
}: ProjectSearchProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
      <Button
        onClick={onToggleArchived}
        variant="outline"
        className="h-[44px] rounded-[10px] border-[#7A9992] text-[#7A9992] dark:text-[#CCCCCC] hover:bg-[#7A9992]/10"
      >
        {showArchived ? (
          <>
            <ArchiveX className="mr-2 h-4 w-4" />
            Aktive Projekte ({archivedCount > 0 ? `${archivedCount} archiviert` : 'keine archivierten'})
          </>
        ) : (
          <>
            <Archive className="mr-2 h-4 w-4" />
            Archivierte Projekte {archivedCount > 0 && `(${archivedCount})`}
          </>
        )}
      </Button>
    </div>
  );
};
