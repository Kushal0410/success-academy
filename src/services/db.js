import { createClient } from '@supabase/supabase-js';

// Read env variables
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;
let supabaseClient = null;

if (isSupabaseConfigured) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

// Initial seed data for LocalStorage fallback
const DEFAULT_STUDENTS = [
  { id: 'SA-001', name: 'Alex Mercer', password: 'alex', class_grade: 'Grade 10', parent_name: 'William Mercer', contact_number: '+1 555-0199', fees_status: 'Paid', fees_amount: 1500, fees_paid_date: '2026-07-02', join_date: '2026-06-01' }
];


// Helper to initialize local storage (V3 keys to ensure automatic data refresh)
const initLocalStorage = () => {
  if (!localStorage.getItem('sa_students_v3')) {
    localStorage.setItem('sa_students_v3', JSON.stringify(DEFAULT_STUDENTS));
  }
  if (!localStorage.getItem('sa_marks_v2')) {
    localStorage.setItem('sa_marks_v2', JSON.stringify(DEFAULT_MARKS));
  }
  if (!localStorage.getItem('sa_attendance_v2')) {
    localStorage.setItem('sa_attendance_v2', JSON.stringify(DEFAULT_ATTENDANCE));
  }
};

initLocalStorage();

// Local Storage Helper Client
const LocalStorageDb = {
  async getStudents() {
    return JSON.parse(localStorage.getItem('sa_students_v3') || '[]');
  },

  async addStudent(student) {
    const students = await this.getStudents();
    // Validate ID uniqueness
    if (students.some(s => s.id === student.id)) {
      throw new Error(`Student ID ${student.id} already exists.`);
    }
    students.push({
      ...student,
      fees_paid_date: student.fees_status === 'Paid' ? new Date().toISOString().split('T')[0] : ''
    });
    localStorage.setItem('sa_students_v3', JSON.stringify(students));
    return student;
  },

  async deleteStudent(id) {
    let students = await this.getStudents();
    students = students.filter(s => s.id !== id);
    localStorage.setItem('sa_students_v3', JSON.stringify(students));

    // Cascade delete marks and attendance
    let marks = JSON.parse(localStorage.getItem('sa_marks_v2') || '[]');
    marks = marks.filter(m => m.student_id !== id);
    localStorage.setItem('sa_marks_v2', JSON.stringify(marks));

    let attendance = JSON.parse(localStorage.getItem('sa_attendance_v2') || '[]');
    attendance = attendance.filter(a => a.student_id !== id);
    localStorage.setItem('sa_attendance_v2', JSON.stringify(attendance));

    return true;
  },

  async updateStudentFees(id, status) {
    const students = await this.getStudents();
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index].fees_status = status;
      students[index].fees_paid_date = status === 'Paid' ? new Date().toISOString().split('T')[0] : '';
      localStorage.setItem('sa_students_v3', JSON.stringify(students));
      return students[index];
    }
    throw new Error('Student not found');
  },

  async getMarks(studentId) {
    const marks = JSON.parse(localStorage.getItem('sa_marks_v2') || '[]');
    return studentId ? marks.filter(m => m.student_id === studentId) : marks;
  },

  async saveMarks(marksArray) {
    const marks = JSON.parse(localStorage.getItem('sa_marks_v2') || '[]');
    const testName = marksArray[0]?.test_name;
    let filteredMarks = marks;
    if (testName) {
      const studentIds = marksArray.map(m => m.student_id);
      filteredMarks = marks.filter(m => !(m.test_name === testName && studentIds.includes(m.student_id)));
    }
    
    const newMarks = marksArray.map((m, index) => ({
      id: `m_new_${Date.now()}_${index}`,
      ...m
    }));

    const finalMarks = [...filteredMarks, ...newMarks];
    localStorage.setItem('sa_marks_v2', JSON.stringify(finalMarks));
    return newMarks;
  },

  async deleteMark(id) {
    let marks = JSON.parse(localStorage.getItem('sa_marks_v2') || '[]');
    marks = marks.filter(m => m.id !== id);
    localStorage.setItem('sa_marks_v2', JSON.stringify(marks));
    return true;
  },

  async getAttendance(studentId) {
    const attendance = JSON.parse(localStorage.getItem('sa_attendance_v2') || '[]');
    return studentId ? attendance.filter(a => a.student_id === studentId) : attendance;
  },

  async saveAttendance(date, attendanceRecords) {
    const attendance = JSON.parse(localStorage.getItem('sa_attendance_v2') || '[]');
    const filteredAttendance = attendance.filter(a => a.date !== date);
    
    const newRecords = attendanceRecords.map((rec, index) => ({
      id: `a_new_${Date.now()}_${index}`,
      ...rec
    }));

    const finalAttendance = [...filteredAttendance, ...newRecords];
    localStorage.setItem('sa_attendance_v2', JSON.stringify(finalAttendance));
    return newRecords;
  },

  async getStats() {
    const students = await this.getStudents();
    const attendance = JSON.parse(localStorage.getItem('sa_attendance_v2') || '[]');

    const totalStudents = students.length;
    const paidStudents = students.filter(s => s.fees_status === 'Paid').length;
    const totalFeesCollected = students.filter(s => s.fees_status === 'Paid').reduce((sum, s) => sum + Number(s.fees_amount || 0), 0);
    const totalFeesPending = students.filter(s => s.fees_status === 'Pending').reduce((sum, s) => sum + Number(s.fees_amount || 0), 0);

    const uniqueDates = [...new Set(attendance.map(a => a.date))].sort();
    const latestDate = uniqueDates[uniqueDates.length - 1] || '';
    
    let latestAttendancePercentage = 100;
    if (latestDate) {
      const recordsForLatest = attendance.filter(a => a.date === latestDate);
      const presentCount = recordsForLatest.filter(a => a.status === 'Present' || a.status === 'Late').length;
      if (recordsForLatest.length > 0) {
        latestAttendancePercentage = Math.round((presentCount / recordsForLatest.length) * 100);
      }
    }

    return {
      totalStudents,
      paidCount: paidStudents,
      pendingCount: totalStudents - paidStudents,
      totalFeesCollected,
      totalFeesPending,
      latestAttendancePercentage
    };
  }
};

// Unified Exporter wrapping Supabase and LocalStorage
export const db = {
  isSupabase() {
    return isSupabaseConfigured;
  },

  async loginStudent(id, password) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabaseClient
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        throw new Error('Student ID not found');
      }
      if (data.password !== password) {
        throw new Error('Incorrect password');
      }
      return data;
    } else {
      const students = await LocalStorageDb.getStudents();
      const student = students.find(s => s.id === id);
      if (!student) {
        throw new Error('Student ID not found');
      }
      if (student.password !== password) {
        throw new Error('Incorrect password');
      }
      return student;
    }
  },

  async getStudents() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabaseClient
        .from('students')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      return LocalStorageDb.getStudents();
    }
  },

  async addStudent(student) {
    if (isSupabaseConfigured) {
      const paidDate = student.fees_status === 'Paid' ? new Date().toISOString().split('T')[0] : null;
      const { data, error } = await supabaseClient
        .from('students')
        .insert([{ ...student, fees_paid_date: paidDate }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      return LocalStorageDb.addStudent(student);
    }
  },

  async deleteStudent(id) {
    if (isSupabaseConfigured) {
      const { error } = await supabaseClient
        .from('students')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } else {
      return LocalStorageDb.deleteStudent(id);
    }
  },

  async updateStudentFees(id, status) {
    const paidDate = status === 'Paid' ? new Date().toISOString().split('T')[0] : '';
    if (isSupabaseConfigured) {
      const { data, error } = await supabaseClient
        .from('students')
        .update({ fees_status: status, fees_paid_date: paidDate })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      return LocalStorageDb.updateStudentFees(id, status);
    }
  },

  async getMarks(studentId = null) {
    if (isSupabaseConfigured) {
      let query = supabaseClient.from('marks').select('*').order('test_date', { ascending: true });
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      return LocalStorageDb.getMarks(studentId);
    }
  },

  async saveMarks(marksArray) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabaseClient
        .from('marks')
        .insert(marksArray)
        .select();
      if (error) throw error;
      return data;
    } else {
      return LocalStorageDb.saveMarks(marksArray);
    }
  },

  async deleteMark(id) {
    if (isSupabaseConfigured) {
      const { error } = await supabaseClient
        .from('marks')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } else {
      return LocalStorageDb.deleteMark(id);
    }
  },

  async getAttendance(studentId = null) {
    if (isSupabaseConfigured) {
      let query = supabaseClient.from('attendance').select('*').order('date', { ascending: true });
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      return LocalStorageDb.getAttendance(studentId);
    }
  },

  async saveAttendance(date, attendanceRecords) {
    if (isSupabaseConfigured) {
      await supabaseClient.from('attendance').delete().eq('date', date);
      const { data, error } = await supabaseClient
        .from('attendance')
        .insert(attendanceRecords)
        .select();
      if (error) throw error;
      return data;
    } else {
      return LocalStorageDb.saveAttendance(date, attendanceRecords);
    }
  },

  async getStats() {
    if (isSupabaseConfigured) {
      const students = await this.getStudents();
      const attendance = await this.getAttendance();
      
      const totalStudents = students.length;
      const paidStudents = students.filter(s => s.fees_status === 'Paid').length;
      const totalFeesCollected = students.filter(s => s.fees_status === 'Paid').reduce((sum, s) => sum + Number(s.fees_amount || 0), 0);
      const totalFeesPending = students.filter(s => s.fees_status === 'Pending').reduce((sum, s) => sum + Number(s.fees_amount || 0), 0);

      const uniqueDates = [...new Set(attendance.map(a => a.date))].sort();
      const latestDate = uniqueDates[uniqueDates.length - 1] || '';
      
      let latestAttendancePercentage = 100;
      if (latestDate) {
        const recordsForLatest = attendance.filter(a => a.date === latestDate);
        const presentCount = recordsForLatest.filter(a => a.status === 'Present' || a.status === 'Late').length;
        if (recordsForLatest.length > 0) {
          latestAttendancePercentage = Math.round((presentCount / recordsForLatest.length) * 100);
        }
      }

      return {
        totalStudents,
        paidCount: paidStudents,
        pendingCount: totalStudents - paidStudents,
        totalFeesCollected,
        totalFeesPending,
        latestAttendancePercentage
      };
    } else {
      return LocalStorageDb.getStats();
    }
  }
};
