
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type QuickPhrase = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
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
        .order("created_at", { ascending: true });

      if (error) throw error;
      setPhrases(data || []);
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
      const { data, error } = await supabase
        .from("quick_phrases")
        .insert([{ content, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setPhrases((prev) => [...prev, data]);
      toast.success("Schnellphrase hinzugefügt");
      return data;
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
    deletePhrase
  };
};
