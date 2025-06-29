
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  school: string;
}

export interface AttendanceSession {
  id: string;
  user_id: string;
  school: string;
  start_time: string;
  date: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  firstName: string;
  lastName: string;
  arrivalTime: string;
  status: 'On Time' | 'Late';
  timestamp: string;
}
