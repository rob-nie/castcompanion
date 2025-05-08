
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";

export const useUpdateProfile = () => {
  const { user } = useAuth();

  useEffect(() => {
    const updateProfileEmail = async () => {
      if (!user) return;

      try {
        // Check if profile already has an email
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          return;
        }

        // Only update if the email is not set or different
        if (!profile.email || profile.email !== user.email) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ email: user.email })
            .eq('id', user.id);

          if (updateError) {
            console.error('Error updating profile:', updateError);
            return;
          }

          console.log('Profile email updated successfully');
        }
      } catch (error) {
        console.error('Exception in updateProfileEmail:', error);
      }
    };

    if (user) {
      updateProfileEmail();
    }
  }, [user]);

  return { user };
};
