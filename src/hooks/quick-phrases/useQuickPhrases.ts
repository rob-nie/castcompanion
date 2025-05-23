
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { QuickPhrase } from "./types";
import { 
  fetchUserPhrases, 
  addUserPhrase, 
  updateUserPhrase, 
  deleteUserPhrase, 
  updatePhraseOrder 
} from "./quickPhrasesApi";
import { toast } from "sonner";

export const useQuickPhrases = () => {
  const { user } = useAuth();
  const [phrases, setPhrases] = useState<QuickPhrase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhrases = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchUserPhrases(user.id);
      setPhrases(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Fehler beim Laden der Schnellphrasen: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addPhrase = async (content: string) => {
    if (!user || !content.trim()) return null;

    try {
      // Get the highest order value
      const maxOrder = phrases.length > 0 
        ? Math.max(...phrases.map(p => p.order ?? 0)) 
        : -1;
      
      const newPhrase = await addUserPhrase(user.id, content, maxOrder);
      setPhrases((prev) => [...prev, newPhrase]);
      toast.success("Schnellphrase hinzugefügt");
      return newPhrase;
    } catch (err: any) {
      toast.error(`Fehler beim Hinzufügen: ${err.message}`);
      return null;
    }
  };

  const updatePhrase = async (id: string, content: string) => {
    if (!user || !content.trim()) return false;

    try {
      await updateUserPhrase(id, content);
      setPhrases((prev) => 
        prev.map((phrase) => phrase.id === id ? { ...phrase, content } : phrase)
      );
      toast.success("Schnellphrase aktualisiert");
      return true;
    } catch (err: any) {
      toast.error(`Fehler beim Aktualisieren: ${err.message}`);
      return false;
    }
  };

  const deletePhrase = async (id: string) => {
    if (!user) return false;

    try {
      await deleteUserPhrase(id);
      setPhrases((prev) => prev.filter((phrase) => phrase.id !== id));
      toast.success("Schnellphrase gelöscht");
      return true;
    } catch (err: any) {
      toast.error(`Fehler beim Löschen: ${err.message}`);
      return false;
    }
  };

  const reorderPhrases = async (startIndex: number, endIndex: number) => {
    if (!user) return false;
    
    // Create new array with reordered phrases
    const newItems = Array.from(phrases);
    const [removed] = newItems.splice(startIndex, 1);
    newItems.splice(endIndex, 0, removed);
    
    // Update local state immediately for responsive UI
    setPhrases(newItems);
    
    try {
      // Update order values in database
      const updates = newItems.map((phrase, index) => ({
        id: phrase.id,
        order: index
      }));
      
      await updatePhraseOrder(updates);
      toast.success("Reihenfolge aktualisiert");
      return true;
    } catch (err: any) {
      // Restore original order on error
      fetchPhrases();
      toast.error(`Fehler beim Aktualisieren der Reihenfolge: ${err.message}`);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPhrases();
    }
  }, [user]);

  return {
    phrases,
    isLoading,
    error,
    fetchPhrases,
    addPhrase,
    updatePhrase,
    deletePhrase,
    reorderPhrases
  };
};
