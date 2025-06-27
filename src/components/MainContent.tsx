
import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { AttendanceForm } from '@/components/AttendanceForm';
import { AttendanceHistory } from '@/components/AttendanceHistory';
import { HeroSection } from '@/components/HeroSection';

export const MainContent = () => {
  const [currentView, setCurrentView] = useState<'attendance' | 'history'>('attendance');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6d192' }}>
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <HeroSection />
      
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
