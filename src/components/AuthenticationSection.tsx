
import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { HeroSection } from '@/components/HeroSection';

interface AuthenticationSectionProps {
  onAuthSuccess: () => void;
}

export const AuthenticationSection = ({ onAuthSuccess }: AuthenticationSectionProps) => {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6d192' }}>
      <HeroSection />
      
      <div className="max-w-md mx-auto px-4 py-8">
        {showSignup ? (
          <SignupForm 
            onToggleForm={() => setShowSignup(false)}
            onSuccess={onAuthSuccess}
          />
        ) : (
          <LoginForm 
            onToggleForm={() => setShowSignup(true)}
            onSuccess={onAuthSuccess}
          />
        )}
      </div>
    </div>
  );
};
