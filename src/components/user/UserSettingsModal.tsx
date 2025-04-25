
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSettingsModal({ isOpen, onClose }: UserSettingsModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  
  const handleSave = async () => {
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: email,
        data: { full_name: username }
      });

      if (updateError) throw updateError;

      toast({
        title: "Erfolgreich gespeichert",
        description: "Deine Einstellungen wurden aktualisiert.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Fehler",
        description: "Deine Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Benutzereinstellungen</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Benutzername</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-11 rounded-[10px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-[10px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Darstellung</Label>
            <div className="flex gap-2">
              <Button
                onClick={() => setTheme("light")}
                variant={theme === "light" ? "default" : "outline"}
                className={`flex-1 h-11 rounded-[10px] ${theme === "light" ? "bg-[#14A090] text-white hover:bg-[#14A090]/90" : ""}`}
              >
                Light Mode
              </Button>
              <Button
                onClick={() => setTheme("dark")}
                variant={theme === "dark" ? "default" : "outline"}
                className={`flex-1 h-11 rounded-[10px] ${theme === "dark" ? "bg-[#14A090] text-white hover:bg-[#14A090]/90" : ""}`}
              >
                Dark Mode
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-11 px-5 rounded-[10px]"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSave}
            className="h-11 px-5 rounded-[10px] bg-[#14A090] text-white hover:bg-[#14A090]/90"
          >
            Änderungen speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
