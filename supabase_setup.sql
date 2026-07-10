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
    join_date TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD'),
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
INSERT INTO students (id, name, password, class_grade, parent_name, contact_number, fees_status, fees_amount, join_date, fees_paid_date)
VALUES 
('SA-001', 'Alex Mercer', 'alex', 'Grade 10', 'William Mercer', '+1 555-0199', 'Paid', 1500, '2026-06-01', '2026-07-02'),
('SA-002', 'Sarah Connor', 'sarah', 'Grade 12', 'Jane Connor', '+1 555-0144', 'Pending', 2000, '2026-05-15', ''),
('SA-003', 'Bruce Wayne', 'bruce', 'Grade 11', 'Thomas Wayne', '+1 555-0122', 'Paid', 1800, '2026-06-10', '2026-07-04'),
('SA-004', 'Peter Parker', 'peter', 'Grade 10', 'May Parker', '+1 555-0188', 'Pending', 1500, '2026-06-20', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marks (student_id, test_name, subject, test_date, marks_obtained, total_marks, comments)
VALUES
('SA-001', 'Algebra Quiz 1', 'Maths', '2026-06-14', 42, 50, 'Excellent analytical work!'),
('SA-001', 'Calculus Basics', 'Maths', '2026-06-21', 45, 50, 'Great understanding of derivatives.'),
('SA-001', 'Trigonometry Assessment', 'Maths', '2026-06-28', 38, 50, 'Focus more on identities.'),
('SA-001', 'Statistics Weekly Test', 'Maths', '2026-07-05', 48, 50, 'Top of the class!'),
('SA-002', 'Newtonian Laws Test', 'Physics', '2026-06-14', 48, 50, 'Outstanding performance.'),
('SA-002', 'Work & Energy', 'Physics', '2026-06-21', 49, 50, 'Perfect problem solving approach.'),
('SA-002', 'Rotational Dynamics', 'Physics', '2026-06-28', 47, 50, 'Great grasp of torque calculations.'),
('SA-003', 'Organic Chem Quiz', 'Chemistry', '2026-06-14', 35, 50, 'Decent, needs revision on alkanes.'),
('SA-003', 'Chemical Bonding', 'Chemistry', '2026-06-21', 40, 50, 'Good conceptual knowledge.'),
('SA-003', 'Thermodynamics Test', 'Chemistry', '2026-06-28', 43, 50, 'Good work on entropy problems.'),
('SA-004', 'Algebra Quiz 1', 'Maths', '2026-06-14', 47, 50, 'Superb! Fast calculations.'),
('SA-004', 'Calculus Basics', 'Maths', '2026-06-21', 49, 50, 'Near perfect!')
ON CONFLICT DO NOTHING;

INSERT INTO attendance (student_id, date, status, remarks)
VALUES
('SA-001', '2026-06-14', 'Present', ''),
('SA-001', '2026-06-21', 'Present', ''),
('SA-001', '2026-06-28', 'Absent', 'Sick leave (informed)'),
('SA-001', '2026-07-05', 'Present', ''),
('SA-002', '2026-06-14', 'Present', ''),
('SA-002', '2026-06-21', 'Present', ''),
('SA-002', '2026-06-28', 'Present', ''),
('SA-002', '2026-07-05', 'Present', ''),
('SA-003', '2026-06-14', 'Present', ''),
('SA-003', '2026-06-21', 'Absent', 'Out of town'),
('SA-003', '2026-06-28', 'Present', ''),
('SA-003', '2026-07-05', 'Present', ''),
('SA-004', '2026-06-14', 'Late', 'Late 10m'),
('SA-004', '2026-06-21', 'Late', 'Late 15m'),
('SA-004', '2026-06-28', 'Late', 'Late 5m'),
('SA-004', '2026-07-02', 'Late', 'Late 8m'),
('SA-004', '2026-07-05', 'Late', 'Late 12m')
ON CONFLICT DO NOTHING;

