
import { useState, useEffect, useCallback } from "react";
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
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setUsername(user?.user_metadata?.full_name || "");
      setEmail(user?.email || "");
      setIsSaving(false);
      setIsClosing(false);
    }
  }, [isOpen, user]);
  
  const safeClose = useCallback(() => {
    setIsClosing(true);
    // Use requestAnimationFrame to ensure React has time to process state updates
    requestAnimationFrame(() => {
      onClose();
      // Reset state after closing
      setTimeout(() => {
        setIsClosing(false);
        setIsSaving(false);
      }, 100);
    });
  }, [onClose]);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || isClosing) return;
    
    try {
      setIsSaving(true);
      
      // Only update if there are actual changes
      if (email !== user?.email || username !== user?.user_metadata?.full_name) {
        const { error: updateError } = await supabase.auth.updateUser({
          email: email,
          data: { full_name: username }
        });

        if (updateError) throw updateError;

        toast({
          title: "Erfolgreich gespeichert",
          description: "Deine Einstellungen wurden aktualisiert.",
        });
      } else {
        toast({
          title: "Keine Änderungen",
          description: "Es wurden keine Änderungen vorgenommen.",
        });
      }
      
      safeClose();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Fehler",
        description: "Deine Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isSaving && !isClosing) {
      safeClose();
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open && !isSaving && !isClosing) {
      safeClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Benutzereinstellungen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Benutzername</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSaving || isClosing}
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
              disabled={isSaving || isClosing}
              className="h-11 rounded-[10px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Darstellung</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setTheme("light")}
                disabled={isSaving || isClosing}
                variant={theme === "light" ? "default" : "outline"}
                className={`flex-1 h-11 rounded-[10px] ${theme === "light" ? "bg-[#14A090] text-white hover:bg-[#14A090]/90" : ""}`}
              >
                Light Mode
              </Button>
              <Button
                type="button"
                onClick={() => setTheme("dark")}
                disabled={isSaving || isClosing}
                variant={theme === "dark" ? "default" : "outline"}
                className={`flex-1 h-11 rounded-[10px] ${theme === "dark" ? "bg-[#14A090] text-white hover:bg-[#14A090]/90" : ""}`}
              >
                Dark Mode
              </Button>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving || isClosing}
              className="h-11 px-5 rounded-[10px]"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isClosing}
              className="h-11 px-5 rounded-[10px] bg-[#14A090] text-white hover:bg-[#14A090]/90"
            >
              {isSaving ? "Wird gespeichert..." : "Änderungen speichern"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
