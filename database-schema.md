
# Database Schema for Fraternity Attendance App

This app requires the following Supabase tables:

## 1. users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  school TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

## 2. attendance_sessions
```sql
CREATE TABLE attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions" ON attendance_sessions
  FOR ALL USING (auth.uid() = user_id);
```

## 3. attendance_records
```sql
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  arrivalTime TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('On Time', 'Late')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage records for own sessions" ON attendance_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM attendance_sessions 
      WHERE attendance_sessions.id = attendance_records.session_id 
      AND attendance_sessions.user_id = auth.uid()
    )
  );
```

## Setup Instructions:
1. Create these tables in your Supabase SQL editor
2. The RLS policies ensure users can only access their own data
3. The unique constraint on users.school enforces one account per school
4. Make sure to enable email authentication in Supabase Auth settings
