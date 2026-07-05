-- Success Academy Supabase SQL Setup Script
-- Paste this script into the Supabase SQL Editor to set up your tables and seed data.

-- 1. Create 'students' Table
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    class_grade TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    fees_status TEXT NOT NULL DEFAULT 'Pending',
    fees_amount NUMERIC NOT NULL DEFAULT 0,
    fees_paid_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Create 'marks' Table
CREATE TABLE IF NOT EXISTS marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    test_date DATE NOT NULL,
    marks_obtained NUMERIC NOT NULL,
    total_marks NUMERIC NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Create 'attendance' Table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Note: Since this application runs custom authorization (Parent/Student login with Student ID and Password),
-- you can set up policies based on your auth flows. For public testing/demo, we can allow full read/write,
-- or use standard service role API access.
-- If utilizing custom claims or connecting with Supabase Auth, you can bind policies like:
-- CREATE POLICY "Students can read their own details" ON students FOR SELECT USING (id = auth.uid());
-- For a basic setup, you can create general public policies for testing:
CREATE POLICY "Public Read Access for Students" ON students FOR SELECT USING (true);
CREATE POLICY "Public Write Access for Admins" ON students FOR ALL USING (true);

CREATE POLICY "Public Read Access for Marks" ON marks FOR SELECT USING (true);
CREATE POLICY "Public Write Access for Marks" ON marks FOR ALL USING (true);

CREATE POLICY "Public Read Access for Attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "Public Write Access for Attendance" ON attendance FOR ALL USING (true);

-- 5. Seed Initial Data
INSERT INTO students (id, name, password, class_grade, parent_name, contact_number, fees_status, fees_amount)
VALUES 
('SA-001', 'Alex Mercer', 'alex', 'Grade 10', 'William Mercer', '+1 555-0199', 'Paid', 1500)
ON CONFLICT (id) DO NOTHING;
