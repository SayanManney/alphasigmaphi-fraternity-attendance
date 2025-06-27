
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, school: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Try to get user profile, but handle case where table doesn't exist
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            setUser(profile);
          } catch (error) {
            console.log('Users table not found - this is expected on first setup');
            setUser(null);
          }
        }
      } catch (error) {
        console.log('Error checking auth session:', error);
      }
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            setUser(profile);
          } catch (error) {
            console.log('Users table not found - this is expected on first setup');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log('Error in auth state change:', error);
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string, school: string) => {
    try {
      // Check if school already exists
      try {
        const { data: existingSchool } = await supabase
          .from('users')
          .select('id')
          .eq('school', school.trim())
          .limit(1);

        if (existingSchool && existingSchool.length > 0) {
          return { error: 'An account for this school already exists. Please contact the current chapter administrator.' };
        }
      } catch (error) {
        // Table doesn't exist yet, continue with signup
        console.log('Users table not found - this is expected on first setup');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { error: error.message };

      if (data.user) {
        // Try to create user profile
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                email,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                school: school.trim(),
              }
            ]);

          if (profileError) return { error: profileError.message };
        } catch (error) {
          return { error: 'Database tables not set up yet. Please create the required tables in Supabase first.' };
        }
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred during sign up.' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: error.message };
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred during sign in.' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
