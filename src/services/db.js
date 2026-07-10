import { createClient } from '@supabase/supabase-js';

// Read env variables
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase configuration missing! Please ensure that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are defined.'
  );
}

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const db = {
  isSupabase() {
    return true;
  },

  async loginStudent(id, password) {
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
  },

  async getStudents() {
    const { data, error } = await supabaseClient
      .from('students')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  },

  async addStudent(student) {
    const paidDate = student.fees_status === 'Paid' ? new Date().toISOString().split('T')[0] : null;
    const { data, error } = await supabaseClient
      .from('students')
      .insert([{ ...student, fees_paid_date: paidDate }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteStudent(id) {
    const { error } = await supabaseClient
      .from('students')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async updateStudentFees(id, status) {
    const paidDate = status === 'Paid' ? new Date().toISOString().split('T')[0] : '';
    const { data, error } = await supabaseClient
      .from('students')
      .update({ fees_status: status, fees_paid_date: paidDate })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getMarks(studentId = null) {
    let query = supabaseClient.from('marks').select('*').order('test_date', { ascending: true });
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async saveMarks(marksArray) {
    const { data, error } = await supabaseClient
      .from('marks')
      .insert(marksArray)
      .select();
    if (error) throw error;
    return data;
  },

  async deleteMark(id) {
    const { error } = await supabaseClient
      .from('marks')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async getAttendance(studentId = null) {
    let query = supabaseClient.from('attendance').select('*').order('date', { ascending: true });
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async saveAttendance(date, attendanceRecords) {
    await supabaseClient.from('attendance').delete().eq('date', date);
    const { data, error } = await supabaseClient
      .from('attendance')
      .insert(attendanceRecords)
      .select();
    if (error) throw error;
    return data;
  },

  async getStats() {
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
  }
};
