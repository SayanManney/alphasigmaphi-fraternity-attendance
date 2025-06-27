
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AuthenticationSection } from '@/components/AuthenticationSection';
import { MainContent } from '@/components/MainContent';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const handleAuthSuccess = () => {
    toast({
      title: "Welcome! 🎉",
      description: "Successfully logged in to your chapter account",
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthenticationSection onAuthSuccess={handleAuthSuccess} />;
  }

  return <MainContent />;
};

export default Index;
