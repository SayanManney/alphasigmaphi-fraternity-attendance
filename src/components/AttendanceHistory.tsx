
import React from 'react';
import { Calendar } from 'lucide-react';

export const AttendanceHistory = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Past Attendance Sessions</h2>
        <p className="text-gray-600">View and download your chapter's attendance history</p>
      </div>

      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Past Sessions</h3>
        <p className="text-gray-600">Start taking attendance to see your session history here.</p>
      </div>
    </div>
  );
};
