
import { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  school: string;
}

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
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string, firstName: string, lastName: string, school: string) => {
    // Simple mock authentication - just set the user
    const newUser: User = {
      id: Math.random().toString(36),
      email,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      school: school.trim(),
    };
    setUser(newUser);
    return {};
  };

  const signIn = async (email: string, password: string) => {
    // Simple mock authentication - just set a mock user
    const mockUser: User = {
      id: Math.random().toString(36),
      email,
      firstName: 'Demo',
      lastName: 'User',
      school: 'Demo University',
    };
    setUser(mockUser);
    return {};
  };

  const signOut = async () => {
    setUser(null);
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
