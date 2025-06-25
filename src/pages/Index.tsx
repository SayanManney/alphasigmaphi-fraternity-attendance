
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Clock, Users, CheckCircle, Timer } from 'lucide-react';

interface AttendanceRecord {
  firstName: string;
  lastName: string;
  arrivalTime: string;
  status: 'On Time' | 'Late';
  timestamp: Date;
}

const Index = () => {
  const [chapterStarted, setChapterStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Set current time on load
  useEffect(() => {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    setArrivalTime(timeString);
  }, []);

  const handleStartChapter = () => {
    const now = new Date();
    setStartTime(now);
    setChapterStarted(true);
    console.log('Chapter started at:', now);
    
    toast({
      title: "Chapter Started! 🔥",
      description: `Official start time: ${now.toLocaleTimeString()}`,
    });
  };

  const calculateStatus = (arrivalTimeStr: string): 'On Time' | 'Late' => {
    if (!startTime) return 'On Time';
    
    const [hours, minutes] = arrivalTimeStr.split(':').map(Number);
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

    setIsSubmitting(true);

    const status = calculateStatus(arrivalTime);
    const newRecord: AttendanceRecord = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      arrivalTime,
      status,
      timestamp: new Date()
    };

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setAttendanceRecords(prev => [...prev, newRecord]);
    
    // Clear form
    setFirstName('');
    setLastName('');
    
    // Reset arrival time to current time
    const now = new Date();
    setArrivalTime(now.toTimeString().slice(0, 5));

    setIsSubmitting(false);

    toast({
      title: "✅ Checked In Successfully!",
      description: `Status: ${status}`,
    });

    console.log('New attendance record:', newRecord);
  };

  const handleExportAttendance = () => {
    if (attendanceRecords.length === 0) return;

    // In a real app, this would trigger the Google Sheets export
    console.log('Exporting attendance records:', attendanceRecords);
    
    toast({
      title: "✅ Attendance emailed!",
      description: "Attendance sheet sent to chapter president",
    });
  };

  const onTimeCount = attendanceRecords.filter(r => r.status === 'On Time').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'Late').length;
  const totalCount = attendanceRecords.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Admin Controls */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={handleExportAttendance}
          disabled={attendanceRecords.length === 0}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Export Attendance
        </Button>
      </div>

      {/* Hero Section */}
      <div className="w-full">
        <img 
          src="/lovable-uploads/ebd7cbd0-9ec9-4e03-9808-351331665b4a.png" 
          alt="AZΦ Chapter Miami 2025-2026"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {!chapterStarted ? (
          /* Start Chapter Button */
          <div className="text-center animate-fade-in">
            <Button
              onClick={handleStartChapter}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl px-12 py-6 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl animate-pulse"
            >
              <Clock className="mr-3 h-6 w-6" />
              Start Chapter
            </Button>
          </div>
        ) : (
          /* Attendance Form */
          <div className="animate-slide-in-right space-y-6">
            <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chapter Attendance</h2>
                <p className="text-gray-600">
                  Started at {startTime?.toLocaleTimeString()}
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
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
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
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
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
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg rounded-full shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
              <Card className="p-6 shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50 animate-fade-in">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
                    <Users className="mr-2 h-5 w-5" />
                    Live Attendance Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">{totalCount}</div>
                      <div className="text-sm text-gray-600">Total Checked In</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
                        <Clock className="mr-1 h-5 w-5" />
                        {onTimeCount}
                      </div>
                      <div className="text-sm text-gray-600">On Time</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-orange-600 flex items-center justify-center">
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
    </div>
  );
};

export default Index;
