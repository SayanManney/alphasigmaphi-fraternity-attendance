
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { AttendanceSession, AttendanceRecord } from '@/types/auth';
import { Download, Calendar, Users, Clock, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AttendanceHistory = () => {
  const [sessions, setSessions] = useState<(AttendanceSession & { records: AttendanceRecord[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (sessionsError) throw sessionsError;

      const sessionsWithRecords = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const { data: records, error: recordsError } = await supabase
            .from('attendance_records')
            .select('*')
            .eq('session_id', session.id)
            .order('timestamp', { ascending: true });

          if (recordsError) throw recordsError;

          return {
            ...session,
            records: records || []
          };
        })
      );

      setSessions(sessionsWithRecords);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (session: AttendanceSession & { records: AttendanceRecord[] }) => {
    const headers = ['First Name', 'Last Name', 'Arrival Time', 'Status', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...session.records.map(record => [
        record.firstName,
        record.lastName,
        record.arrivalTime,
        record.status,
        new Date(record.timestamp).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Chapter_Attendance_${session.date}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "✅ Download Complete",
      description: "CSV file has been downloaded successfully.",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-900"></div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Past Sessions</h3>
        <p className="text-gray-600">Start taking attendance to see your session history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Past Attendance Sessions</h2>
        <p className="text-gray-600">View and download your chapter's attendance history</p>
      </div>

      <div className="grid gap-6">
        {sessions.map((session) => {
          const onTimeCount = session.records.filter(r => r.status === 'On Time').length;
          const lateCount = session.records.filter(r => r.status === 'Late').length;
          const totalCount = session.records.length;

          return (
            <Card key={session.id} className="p-6 bg-gradient-to-br from-red-50 to-red-100/50 border-0 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                  <Calendar className="h-5 w-5 text-red-900" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Started at {new Date(session.start_time).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => downloadCSV(session)}
                  className="bg-red-900 hover:bg-red-800 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/80 rounded-lg p-4 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center justify-center text-2xl font-bold text-red-900 mb-1">
                    <Users className="mr-2 h-5 w-5" />
                    {totalCount}
                  </div>
                  <div className="text-sm text-gray-600 text-center">Total Attendees</div>
                </div>

                <div className="bg-white/80 rounded-lg p-4 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center justify-center text-2xl font-bold text-red-900 mb-1">
                    <Clock className="mr-2 h-5 w-5" />
                    {onTimeCount}
                  </div>
                  <div className="text-sm text-gray-600 text-center">On Time</div>
                </div>

                <div className="bg-white/80 rounded-lg p-4 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center justify-center text-2xl font-bold text-red-900 mb-1">
                    <Timer className="mr-2 h-5 w-5" />
                    {lateCount}
                  </div>
                  <div className="text-sm text-gray-600 text-center">Late</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
