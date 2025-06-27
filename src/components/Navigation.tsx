
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Users, History } from 'lucide-react';

interface NavigationProps {
  currentView: 'attendance' | 'history';
  onViewChange: (view: 'attendance' | 'history') => void;
}

export const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-red-900">AZΦ Attendance</h1>
            <span className="text-sm text-gray-600">| {user?.school}</span>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant={currentView === 'attendance' ? 'default' : 'ghost'}
              onClick={() => onViewChange('attendance')}
              className={currentView === 'attendance' ? 'bg-red-900 hover:bg-red-800' : ''}
            >
              <Users className="mr-2 h-4 w-4" />
              Take Attendance
            </Button>

            <Button
              variant={currentView === 'history' ? 'default' : 'ghost'}
              onClick={() => onViewChange('history')}
              className={currentView === 'history' ? 'bg-red-900 hover:bg-red-800' : ''}
            >
              <History className="mr-2 h-4 w-4" />
              Past Attendance
            </Button>

            <Button
              variant="ghost"
              onClick={signOut}
              className="text-red-900 hover:text-red-800 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
