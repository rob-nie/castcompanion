
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";

export const useUpdateProfile = () => {
  const { user } = useAuth();

  useEffect(() => {
    const updateProfileData = async () => {
      if (!user) return;

      try {
        // Check if profile already exists
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', user.id)
          .single();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          return;
        }

        // Get full_name from user metadata
        const fullName = user.user_metadata?.full_name || null;
        
        // Only update if the email or full_name is not set or different
        const needsUpdate = 
          !profile?.email || 
          profile.email !== user.email || 
          profile?.full_name !== fullName;
          
        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              email: user.email,
              full_name: fullName
            })
            .eq('id', user.id);

          if (updateError) {
            console.error('Error updating profile:', updateError);
            return;
          }

          console.log('Profile data updated successfully');
        }
      } catch (error) {
        console.error('Exception in updateProfileData:', error);
      }
    };

    if (user) {
      updateProfileData();
    }
  }, [user]);

  return { user };
};
