
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Settings, UserIcon } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthProvider";

export function UserMenu({ isMobile }: { isMobile: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center text-sm cursor-pointer">
        {isMobile ? (
          <UserIcon className="h-6 w-6 text-[#0A1915] dark:text-white" />
        ) : (
          <span className="font-medium text-[#0A1915] dark:text-white">
            {user.user_metadata.full_name || user.email}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Einstellungen
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Abmelden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
