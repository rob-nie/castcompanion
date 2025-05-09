
import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuickPhrasesSection } from "@/components/settings/QuickPhrasesSection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Update profile in public.profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ email })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        email,
        data: { full_name: fullName }
      });

      if (updateError) throw updateError;

      toast.success("Profil erfolgreich aktualisiert");
    } catch (error: any) {
      toast.error(`Fehler beim Aktualisieren: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
        
      if (error) throw error;

      await supabase.auth.signOut();
      toast.success("Konto erfolgreich gelöscht");
    } catch (error: any) {
      toast.error(`Fehler beim Löschen: ${error.message}`);
      setShowDeleteConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header currentPage="settings" />
      
      <main className="flex-grow px-6 md:px-12 lg:px-24 py-16">
        <div className="mx-auto max-w-[600px]">
          <h1 className="text-2xl font-medium mb-8 text-[#0A1915] dark:text-white">Profileinstellungen</h1>
          
          <div className="space-y-10">
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-[#0A1915] dark:text-white">Allgemeine Daten</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-left">Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-left">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-[#14A090] hover:bg-[#14A090]/90"
                  >
                    Speichern
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Phrases Section */}
            <QuickPhrasesSection />

            {/* Danger Zone */}
            <div className="space-y-4 border-t pt-6 border-[#CCCCCC] dark:border-[#5E6664]">
              <h2 className="text-xl font-medium text-[#0A1915] dark:text-white">Gefahrenzone</h2>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
              >
                Konto löschen
              </Button>
            </div>
          </div>
        </div>
      </main>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konto löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Bist du sicher, dass du dein Konto löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Konto löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};
