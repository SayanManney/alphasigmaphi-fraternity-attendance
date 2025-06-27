
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Clock, Users, CheckCircle, Timer } from 'lucide-react';

export const AttendanceForm = () => {
  const [chapterStarted, setChapterStarted] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [customStartTime, setCustomStartTime] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Set current time on load
  useEffect(() => {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    setArrivalTime(timeString);
    setCustomStartTime(timeString);
  }, []);

  const handleStartChapter = async () => {
    if (!customStartTime || !user) {
      toast({
        title: "Missing Information",
        description: "Please enter a start time for the chapter",
        variant: "destructive",
      });
      return;
    }

    try {
      const now = new Date();
      const [hours, minutes] = customStartTime.split(':').map(Number);
      const chapterStart = new Date(now);
      chapterStart.setHours(hours, minutes, 0, 0);
      
      const { data: session, error } = await supabase
        .from('attendance_sessions')
        .insert([
          {
            user_id: user.id,
            school: user.school,
            start_time: chapterStart.toISOString(),
            date: now.toISOString().split('T')[0],
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(session);
      setChapterStarted(true);
      console.log('Chapter started at:', chapterStart);
      
      toast({
        title: "Chapter Started! 🔥",
        description: `Official start time: ${chapterStart.toLocaleTimeString()}`,
      });
    } catch (error) {
      console.error('Error starting chapter:', error);
      toast({
        title: "Error",
        description: "Failed to start chapter session",
        variant: "destructive",
      });
    }
  };

  const calculateStatus = (arrivalTimeStr: string): 'On Time' | 'Late' => {
    if (!currentSession) return 'On Time';
    
    const [hours, minutes] = arrivalTimeStr.split(':').map(Number);
    const startTime = new Date(currentSession.start_time);
    const arrivalDate = new Date(startTime);
    arrivalDate.setHours(hours, minutes, 0, 0);
    
    const timeDiff = arrivalDate.getTime() - startTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    return minutesDiff <= 10 ? 'On Time' : 'Late';
  };

  const checkDuplicate = (first: string, last: string): boolean => {
    return attendanceRecords.some(record => 
      record.firstName.toLowerCase() === first.toLowerCase() && 
      record.lastName.toLowerCase() === last.toLowerCase()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both first and last name",
        variant: "destructive",
      });
      return;
    }

    if (checkDuplicate(firstName.trim(), lastName.trim())) {
      toast({
        title: "Already Checked In",
        description: "You're already checked in.",
        variant: "destructive",
      });
      return;
    }

    if (!currentSession) {
      toast({
        title: "No Active Session",
        description: "Please start a chapter session first",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const status = calculateStatus(arrivalTime);
      const timestamp = new Date().toISOString();

      const { data: record, error } = await supabase
        .from('attendance_records')
        .insert([
          {
            session_id: currentSession.id,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            arrivalTime,
            status,
            timestamp,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setAttendanceRecords(prev => [...prev, record]);
      
      // Clear form
      setFirstName('');
      setLastName('');
      
      // Reset arrival time to current time
      const now = new Date();
      setArrivalTime(now.toTimeString().slice(0, 5));

      toast({
        title: "✅ Checked In Successfully!",
        description: `Status: ${status}`,
      });

      console.log('New attendance record:', record);
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast({
        title: "Error",
        description: "Failed to submit attendance",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onTimeCount = attendanceRecords.filter(r => r.status === 'On Time').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'Late').length;
  const totalCount = attendanceRecords.length;

  return (
    <div className="space-y-8">
      {!chapterStarted ? (
        /* Chapter Start Section */
        <div className="text-center animate-fade-in space-y-6">
          <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Set Chapter Start Time</h2>
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                  Chapter Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={customStartTime}
                  onChange={(e) => setCustomStartTime(e.target.value)}
                  className="border-gray-200 focus:border-red-900 focus:ring-red-900"
                />
              </div>
            </div>
          </Card>
          
          <Button
            onClick={handleStartChapter}
            className="bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white text-xl px-12 py-6 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl"
            style={{
              boxShadow: '0 0 20px rgba(127, 29, 29, 0.3), 0 0 40px rgba(127, 29, 29, 0.1)'
            }}
          >
            <Clock className="mr-3 h-6 w-6" />
            Start Chapter
          </Button>
        </div>
      ) : (
        /* Attendance Form */
        <div className="animate-slide-in-right space-y-6">
          <Card className="p-8 shadow-xl border-0 bg-gradient-to-br from-red-50 to-red-100/50 backdrop-blur-sm">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Chapter Attendance</h2>
              <p className="text-gray-600">
                Started at {new Date(currentSession?.start_time).toLocaleTimeString()}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border-gray-200 focus:border-red-900 focus:ring-red-900 bg-white/80"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border-gray-200 focus:border-red-900 focus:ring-red-900 bg-white/80"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrivalTime" className="text-sm font-medium text-gray-700">
                  Arrival Time
                </Label>
                <Input
                  id="arrivalTime"
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="border-gray-200 focus:border-red-900 focus:ring-red-900 bg-white/80"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white py-3 text-lg rounded-full shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Checking In...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Submit Attendance
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Live Summary */}
          {totalCount > 0 && (
            <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100/50 backdrop-blur-sm animate-fade-in">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
                  <Users className="mr-2 h-5 w-5" />
                  Live Attendance Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-white/80 rounded-lg p-4 shadow-sm backdrop-blur-sm">
                    <div className="text-2xl font-bold text-red-900">{totalCount}</div>
                    <div className="text-sm text-gray-600">Total Checked In</div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4 shadow-sm backdrop-blur-sm">
                    <div className="text-2xl font-bold text-red-900 flex items-center justify-center">
                      <Clock className="mr-1 h-5 w-5" />
                      {onTimeCount}
                    </div>
                    <div className="text-sm text-gray-600">On Time</div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4 shadow-sm backdrop-blur-sm">
                    <div className="text-2xl font-bold text-red-900 flex items-center justify-center">
                      <Timer className="mr-1 h-5 w-5" />
                      {lateCount}
                    </div>
                    <div className="text-sm text-gray-600">Late</div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
