
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Navigation } from '@/components/Navigation';
import { AttendanceForm } from '@/components/AttendanceForm';
import { AttendanceHistory } from '@/components/AttendanceHistory';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { user, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [currentView, setCurrentView] = useState<'attendance' | 'history'>('attendance');
  const { toast } = useToast();

  const handleAuthSuccess = () => {
    toast({
      title: "Welcome! 🎉",
      description: "Successfully logged in to your chapter account",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f6d192' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f6d192' }}>
        {/* Hero Section */}
        <div className="w-full">
          <img 
            src="/lovable-uploads/ebd7cbd0-9ec9-4e03-9808-351331665b4a.png" 
            alt="AZΦ Chapter Miami 2025-2026"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Authentication Forms */}
        <div className="max-w-md mx-auto px-4 py-8">
          {showSignup ? (
            <SignupForm 
              onToggleForm={() => setShowSignup(false)}
              onSuccess={handleAuthSuccess}
            />
          ) : (
            <LoginForm 
              onToggleForm={() => setShowSignup(true)}
              onSuccess={handleAuthSuccess}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6d192' }}>
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      {/* Hero Section */}
      <div className="w-full">
        <img 
          src="/lovable-uploads/ebd7cbd0-9ec9-4e03-9808-351331665b4a.png" 
          alt="AZΦ Chapter Miami 2025-2026"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {currentView === 'attendance' ? (
          <AttendanceForm />
        ) : (
          <AttendanceHistory />
        )}
      </div>
    </div>
  );
};

export default Index;
