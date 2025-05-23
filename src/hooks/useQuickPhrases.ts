
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type QuickPhrase = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  order: number | null;
  user_id?: string; // Added user_id as optional since it comes from the database
};

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
      const { data, error } = await supabase
        .from("quick_phrases")
        .select("*")
        .order("order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      // Convert the data to ensure each item has the order property
      const typedData = data.map(item => ({
        ...item,
        order: item.order === undefined ? null : item.order
      })) as QuickPhrase[];
      
      setPhrases(typedData);
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
      
      const { data, error } = await supabase
        .from("quick_phrases")
        .insert([{ 
          content, 
          user_id: user.id,
          order: maxOrder + 1 
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Make sure the returned object has all required fields
      const newPhrase: QuickPhrase = {
        ...data,
        order: data.order !== undefined ? data.order : null
      };
      
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
      const { error } = await supabase
        .from("quick_phrases")
        .update({ content })
        .eq("id", id);

      if (error) throw error;
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
      const { error } = await supabase
        .from("quick_phrases")
        .delete()
        .eq("id", id);

      if (error) throw error;
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
      
      for (const update of updates) {
        const { error } = await supabase
          .from("quick_phrases")
          .update({ order: update.order })
          .eq("id", update.id);
          
        if (error) throw error;
      }
      
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
