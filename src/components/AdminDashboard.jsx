import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { 
  Users, Award, Calendar, CreditCard, Search, UserPlus, 
  Trash2, Plus, CheckCircle, AlertCircle, Save, CalendarCheck 
} from 'lucide-react';

export default function AdminDashboard({ onLogout }) {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    paidCount: 0,
    pendingCount: 0,
    totalFeesCollected: 0,
    totalFeesPending: 0,
    latestAttendancePercentage: 100
  });

  const [activeAdminTab, setActiveAdminTab] = useState('students');
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');

  // Modals / Form States
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    id: '',
    name: '',
    password: '',
    class_grade: 'Grade 10',
    parent_name: '',
    contact_number: '',
    fees_status: 'Pending',
    fees_amount: 1500,
    join_date: new Date().toISOString().split('T')[0]
  });

  // Marks Entry State
  const [tests, setTests] = useState([]);
  const [selectedTestName, setSelectedTestName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Grade 10');
  const [selectedSubject, setSelectedSubject] = useState('Tamil');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [maxMarks, setMaxMarks] = useState(50);
  
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);
  const [marksToSave, setMarksToSave] = useState({}); // { student_id: { score, comments } }

  // New Restructured Marks States
  const [marksList, setMarksList] = useState([]);
  const [marksSubTab, setMarksSubTab] = useState('gradebook');
  const [gradebookSearch, setGradebookSearch] = useState('');
  const [gradebookSubject, setGradebookSubject] = useState('All');

  // Attendance Entry State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { student_id: { status, remarks } }

  // Notification Feedbacks
  const [alertMessage, setAlertMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [studentsData, statsData, marksData] = await Promise.all([
        db.getStudents(),
        db.getStats(),
        db.getMarks()
      ]);
      setStudents(studentsData);
      setStats(statsData);
      setMarksList(marksData);

      // Extract unique test names
      const uniqueTests = [];
      const seen = new Set();
      marksData.forEach(m => {
        const key = `${m.test_name} (${m.subject})`;
        if (!seen.has(key)) {
          seen.add(key);
          const studentObj = studentsData.find(s => s.id === m.student_id);
          const testGrade = studentObj ? studentObj.class_grade : 'Grade 10';
          uniqueTests.push({ 
            name: m.test_name, 
            subject: m.subject, 
            date: m.test_date, 
            maxMarks: m.total_marks,
            grade: testGrade
          });
        }
      });
      setTests(uniqueTests);
      if (uniqueTests.length > 0 && !selectedTestName) {
        setSelectedTestName(uniqueTests[0].name);
        setSelectedGrade(uniqueTests[0].grade || 'Grade 10');
      }
    } catch (err) {
      showNotice(err.message || 'Error loading dashboard records.', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Pre-populate marks grid when test selection changes or students list updates
  useEffect(() => {
    if (selectedTestName && students.length > 0) {
      const matchTest = tests.find(t => t.name === selectedTestName);
      const subject = matchTest ? matchTest.subject : 'Maths';
      
      // Fetch existing marks for this test
      db.getMarks().then(allMarks => {
        const testMarks = allMarks.filter(m => m.test_name === selectedTestName);
        const map = {};
        
        students.forEach(student => {
          const studentMark = testMarks.find(m => m.student_id === student.id);
          map[student.id] = {
            score: studentMark ? studentMark.marks_obtained : '',
            comments: studentMark ? studentMark.comments : ''
          };
        });
        setMarksToSave(map);
      });
    }
  }, [selectedTestName, students, tests]);

  // Pre-populate attendance grid when date changes
  useEffect(() => {
    if (attendanceDate && students.length > 0) {
      db.getAttendance().then(allAttendance => {
        const dayAttendance = allAttendance.filter(a => a.date === attendanceDate);
        const map = {};
        
        students.forEach(student => {
          const record = dayAttendance.find(a => a.student_id === student.id);
          map[student.id] = {
            status: record ? record.status : 'Present',
            remarks: record ? record.remarks : ''
          };
        });
        setAttendanceRecords(map);
      });
    }
  }, [attendanceDate, students]);

  const showNotice = (text, type = 'success') => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage({ text: '', type: '' }), 5000);
  };

  // Student Account Operations
  const handleAutoGenerateId = () => {
    const nextNum = students.length + 1;
    setNewStudent(prev => ({
      ...prev,
      id: `SA-00${nextNum}`
    }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.id.trim() || !newStudent.name.trim() || !newStudent.password.trim()) {
      showNotice('Please complete Student ID, Name and custom Password.', 'error');
      return;
    }

    try {
      await db.addStudent({
        id: newStudent.id.trim().toUpperCase(),
        name: newStudent.name.trim(),
        password: newStudent.password,
        class_grade: newStudent.class_grade,
        parent_name: newStudent.parent_name.trim() || 'Not Specified',
        contact_number: newStudent.contact_number.trim() || 'N/A',
        fees_status: newStudent.fees_status,
        fees_amount: Number(newStudent.fees_amount || 1500),
        join_date: newStudent.join_date
      });

      showNotice(`Successfully added student ${newStudent.name}`);
      setIsAddStudentOpen(false);
      // Reset form
      setNewStudent({
        id: '',
        name: '',
        password: '',
        class_grade: 'Grade 10',
        parent_name: '',
        contact_number: '',
        fees_status: 'Pending',
        fees_amount: 1500,
        join_date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (err) {
      showNotice(err.message || 'Error writing student account.', 'error');
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete student ${name} (${id})? This will permanently wipe all their weekend test grades and attendance history.`)) {
      try {
        await db.deleteStudent(id);
        showNotice(`Student ${name} deleted successfully.`);
        loadData();
      } catch (err) {
        showNotice(err.message || 'Error deleting student.', 'error');
      }
    }
  };

  // Fees Toggle
  const handleToggleFees = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
      await db.updateStudentFees(id, nextStatus);
      showNotice(`Updated tuition fees status to ${nextStatus}`);
      loadData();
    } catch (err) {
      showNotice('Error toggling payment status.', 'error');
    }
  };

  // Attendance Sheet Save
  const handleSaveAttendance = async () => {
    try {
      const recordsToInsert = Object.keys(attendanceRecords).map(studentId => ({
        student_id: studentId,
        date: attendanceDate,
        status: attendanceRecords[studentId].status,
        remarks: attendanceRecords[studentId].remarks
      }));

      await db.saveAttendance(attendanceDate, recordsToInsert);
      showNotice(`Attendance roll call saved for ${attendanceDate}`);
      loadData();
    } catch (err) {
      showNotice('Error saving attendance.', 'error');
    }
  };

  const handleSetStudentAttendance = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: status
      }
    }));
  };

  const handleAttendanceRemarksChange = (studentId, remarksVal) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: remarksVal
      }
    }));
  };

  const handleDeleteGrade = async (gradeId) => {
    if (window.confirm('Are you sure you want to delete this grade record permanently?')) {
      try {
        await db.deleteMark(gradeId);
        showNotice('Grade record deleted successfully.');
        loadData();
      } catch (err) {
        showNotice('Error deleting grade record.', 'error');
      }
    }
  };

  // Marks Test Operations
  const handleCreateTest = (e) => {
    e.preventDefault();
    if (!selectedTestName.trim()) {
      showNotice('Please enter a valid test name', 'error');
      return;
    }

    const testExists = tests.some(t => t.name.toLowerCase() === selectedTestName.toLowerCase() && t.subject.toLowerCase() === selectedSubject.toLowerCase());
    if (testExists) {
      showNotice('Test already exists with that title and subject.', 'error');
      return;
    }

    const newTestObj = {
      name: selectedTestName.trim(),
      subject: selectedSubject,
      grade: selectedGrade,
      date: testDate,
      maxMarks: Number(maxMarks)
    };

    setTests(prev => [...prev, newTestObj]);
    setIsCreateTestOpen(false);
    showNotice(`Created test slot "${selectedTestName}". Enter scores below.`);
  };

  const handleScoreChange = (studentId, val) => {
    setMarksToSave(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: val
      }
    }));
  };

  const handleCommentChange = (studentId, val) => {
    setMarksToSave(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        comments: val
      }
    }));
  };

  const handleSaveMarks = async () => {
    if (!selectedTestName) {
      showNotice('Please select or create a test slot first.', 'error');
      return;
    }

    const currentTest = tests.find(t => t.name === selectedTestName);
    const subject = currentTest ? currentTest.subject : 'Maths';
    const date = currentTest ? currentTest.date : new Date().toISOString().split('T')[0];
    const totalM = currentTest ? currentTest.maxMarks : 50;

    try {
      const marksArray = [];
      Object.keys(marksToSave).forEach(studentId => {
        const score = marksToSave[studentId].score;
        if (score !== undefined && score !== '') {
          marksArray.push({
            student_id: studentId,
            test_name: selectedTestName,
            subject,
            test_date: date,
            marks_obtained: Number(score),
            total_marks: Number(totalM),
            comments: marksToSave[studentId].comments || ''
          });
        }
      });

      if (marksArray.length === 0) {
        showNotice('No scores entered. Enter at least one score before saving.', 'error');
        return;
      }

      await db.saveMarks(marksArray);
      showNotice(`Successfully saved weekend marks for "${selectedTestName}"`);
      loadData();
    } catch (err) {
      showNotice('Error saving weekend test scores.', 'error');
    }
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          student.id.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesGrade = gradeFilter === 'All' || student.class_grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="portal-container">
      <div className="portal-wrapper">
        {/* Sidebar */}
        <aside className="portal-sidebar">
          <ul className="sidebar-menu">
            <li>
              <button 
                className={`sidebar-btn ${activeAdminTab === 'students' ? 'active' : ''}`}
                onClick={() => setActiveAdminTab('students')}
              >
                <Users size={18} />
                Student Roster
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-btn ${activeAdminTab === 'marks' ? 'active' : ''}`}
                onClick={() => setActiveAdminTab('marks')}
              >
                <Award size={18} />
                Weekend Marks Entry
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-btn ${activeAdminTab === 'attendance' ? 'active' : ''}`}
                onClick={() => setActiveAdminTab('attendance')}
              >
                <CalendarCheck size={18} />
                Daily Attendance
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-btn ${activeAdminTab === 'fees' ? 'active' : ''}`}
                onClick={() => setActiveAdminTab('fees')}
              >
                <CreditCard size={18} />
                Tuition Fees
              </button>
            </li>
          </ul>

          <div className="sidebar-footer">
            <button className="sidebar-btn" style={{ color: 'var(--absent)' }} onClick={onLogout}>
              Logout Admin
            </button>
          </div>
        </aside>

        {/* Content View */}
        <main className="portal-content">
          {/* Header & Feedback banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '800' }}>Admin Command Center</h2>
              <p style={{ color: 'var(--text-muted)' }}>Success Academy Management Dashboard</p>
            </div>
            
            {/* Supabase connection indicator */}
            <span style={{ 
              fontSize: '12px', 
              padding: '6px 12px', 
              borderRadius: '20px', 
              backgroundColor: db.isSupabase() ? 'var(--paid-bg)' : 'var(--bg-surface-light)',
              color: db.isSupabase() ? 'var(--paid)' : 'var(--text-muted)',
              border: '1px solid ' + (db.isSupabase() ? 'var(--paid)' : 'var(--border-light)')
            }}>
              Database Mode: {db.isSupabase() ? 'Live Supabase Cloud' : 'Local Storage Sandbox'}
            </span>
          </div>

          {/* Feedback alerts */}
          {alertMessage.text && (
            <div 
              className="error-banner" 
              style={{ 
                backgroundColor: alertMessage.type === 'error' ? 'var(--absent-bg)' : 'var(--paid-bg)',
                borderColor: alertMessage.type === 'error' ? 'var(--absent)' : 'var(--paid)',
                color: 'var(--text-primary)',
                marginBottom: '24px'
              }}
            >
              {alertMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
              <span>{alertMessage.text}</span>
            </div>
          )}

          {/* General Stats Ribbons */}
          <div className="stats-cards-grid">
            <div className="stat-scorecard">
              <div className="stat-scorecard-info">
                <span>Active Tuition Students</span>
                <h3>{stats.totalStudents}</h3>
              </div>
              <div className="stat-scorecard-icon">
                <Users size={22} />
              </div>
            </div>

            <div className="stat-scorecard">
              <div className="stat-scorecard-info">
                <span>Fees Collected</span>
                <h3 style={{ color: 'var(--paid)' }}>₹{stats.totalFeesCollected}</h3>
              </div>
              <div className="stat-scorecard-icon success-color">
                <CreditCard size={22} />
              </div>
            </div>

            <div className="stat-scorecard">
              <div className="stat-scorecard-info">
                <span>Fees Outstanding</span>
                <h3 style={{ color: 'var(--pending)' }}>₹{stats.totalFeesPending}</h3>
              </div>
              <div className="stat-scorecard-icon warning-color">
                <AlertCircle size={22} />
              </div>
            </div>

            <div className="stat-scorecard">
              <div className="stat-scorecard-info">
                <span>Recent Attendance</span>
                <h3>{stats.latestAttendancePercentage}%</h3>
              </div>
              <div className="stat-scorecard-icon accent-color">
                <CalendarCheck size={22} />
              </div>
            </div>
          </div>

          {/* 1. STUDENT ROSTER TAB PANEL */}
          {activeAdminTab === 'students' && (
            <div className="dashboard-card">
              <div className="card-header-actions">
                <h3>Tuition Roster</h3>
                <button className="btn-cta-primary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => setIsAddStudentOpen(true)}>
                  <UserPlus size={16} /> Add Student
                </button>
              </div>

              {/* Search Toolbar */}
              <div className="toolbar-filters">
                <div className="search-input-wrapper">
                  <Search size={16} className="input-icon" />
                  <input 
                    className="search-input" 
                    placeholder="Search name or ID..." 
                    type="text" 
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>

                <select 
                  className="select-filter"
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                >
                  <option value="All">All Grades</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              {/* Table list */}
              <div className="table-scroll-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Grade</th>
                      <th>Parent Name</th>
                      <th>Contact Number</th>
                      <th>Portal Password</th>
                      <th>Join Date</th>
                      <th>Monthly Fee</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                          No students matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st) => (
                        <tr key={st.id}>
                          <td style={{ fontWeight: '700', color: 'var(--accent)' }}>{st.id}</td>
                          <td style={{ fontWeight: '600' }}>{st.name}</td>
                          <td>{st.class_grade}</td>
                          <td>{st.parent_name}</td>
                          <td>{st.contact_number}</td>
                          <td>
                            <code style={{ fontSize: '13px' }}>{st.password}</code>
                          </td>
                          <td style={{ fontWeight: '600', color: 'var(--accent)' }}>{st.join_date || 'N/A'}</td>
                          <td>₹{st.fees_amount}/mo</td>
                          <td>
                            <button 
                              className="btn-action-delete"
                              onClick={() => handleDeleteStudent(st.id, st.name)}
                              title="Delete Dropout Student"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. WEEKEND MARKS ENTRY TAB PANEL */}
          {activeAdminTab === 'marks' && (
            <div className="dashboard-card">
              {/* Restructured Sub Tabs Navigation */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                borderBottom: '1px solid var(--border-light)', 
                paddingBottom: '16px', 
                marginBottom: '24px' 
              }}>
                <button 
                  className={`sidebar-btn ${marksSubTab === 'gradebook' ? 'active' : ''}`}
                  style={{ width: 'auto', padding: '8px 16px', fontSize: '14.5px', borderRadius: '6px' }}
                  onClick={() => setMarksSubTab('gradebook')}
                  type="button"
                >
                  Gradebook Ledger
                </button>
                <button 
                  className={`sidebar-btn ${marksSubTab === 'entry' ? 'active' : ''}`}
                  style={{ width: 'auto', padding: '8px 16px', fontSize: '14.5px', borderRadius: '6px' }}
                  onClick={() => setMarksSubTab('entry')}
                  type="button"
                >
                  Enter Score Sheet
                </button>
              </div>

              {/* Sub-Tab 1: Gradebook Ledger */}
              {marksSubTab === 'gradebook' && (
                <div>
                  <div className="card-header-actions">
                    <h3>Weekend Gradebook Ledger</h3>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Total Recorded Entries: {marksList.length}
                    </span>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="toolbar-filters">
                    <div className="search-input-wrapper">
                      <Search size={16} className="input-icon" />
                      <input 
                        className="search-input" 
                        placeholder="Search student or test..." 
                        type="text" 
                        value={gradebookSearch}
                        onChange={(e) => setGradebookSearch(e.target.value)}
                      />
                    </div>

                    <select 
                      className="select-filter"
                      value={gradebookSubject}
                      onChange={(e) => setGradebookSubject(e.target.value)}
                    >
                      <option value="All">All Subjects</option>
                      <option value="Tamil">Tamil</option>
                      <option value="English">English</option>
                      <option value="Maths">Maths</option>
                      <option value="Science">Science</option>
                      <option value="Social Science">Social Science</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Economic">Economic</option>
                      <option value="Computer Application">Computer Application</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Bio-zoology">Bio-zoology</option>
                      <option value="bio-botany">bio-botany</option>
                    </select>
                  </div>

                  {/* Ledger Table */}
                  <div className="table-scroll-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Student ID</th>
                          <th>Student Name</th>
                          <th>Test Title</th>
                          <th>Subject</th>
                          <th>Test Date</th>
                          <th>Score</th>
                          <th>Percentage</th>
                          <th>Comments</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marksList
                          .filter(m => {
                            const studentObj = students.find(s => s.id === m.student_id);
                            const studentName = studentObj ? studentObj.name.toLowerCase() : '';
                            const matchesSearch = studentName.includes(gradebookSearch.toLowerCase()) || 
                                                  m.student_id.toLowerCase().includes(gradebookSearch.toLowerCase()) ||
                                                  m.test_name.toLowerCase().includes(gradebookSearch.toLowerCase());
                            const matchesSubject = gradebookSubject === 'All' || m.subject === gradebookSubject;
                            return matchesSearch && matchesSubject;
                          })
                          .map((m) => {
                            const studentObj = students.find(s => s.id === m.student_id);
                            const pct = Math.round((m.marks_obtained / m.total_marks) * 100);
                            return (
                              <tr key={m.id}>
                                <td style={{ fontWeight: '700', color: 'var(--accent)' }}>{m.student_id}</td>
                                <td style={{ fontWeight: '600' }}>{studentObj ? studentObj.name : 'Unknown'}</td>
                                <td>{m.test_name}</td>
                                <td style={{ fontWeight: '600' }}>{m.subject}</td>
                                <td>{m.test_date}</td>
                                <td style={{ fontWeight: '700' }}>
                                  {m.marks_obtained} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>/ {m.total_marks}</span>
                                </td>
                                <td style={{ fontWeight: '700', color: pct >= 80 ? 'var(--paid)' : 'var(--accent)' }}>
                                  {pct}%
                                </td>
                                <td style={{ fontStyle: 'italic', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                                  "{m.comments || '—'}"
                                </td>
                                <td>
                                  <button 
                                    className="btn-action-delete"
                                    onClick={() => handleDeleteGrade(m.id)}
                                    title="Delete Grade Entry"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Enter Score Sheet */}
              {marksSubTab === 'entry' && (
                <div>
                  <div className="card-header-actions">
                    <h3>Weekend Score Entry Sheet</h3>
                    <button className="btn-action-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsCreateTestOpen(true)}>
                      <Plus size={16} /> Create New Test Slot
                    </button>
                  </div>

                  {/* Test Selector */}
                  <div className="toolbar-filters" style={{ marginBottom: '24px' }}>
                    <div className="form-group" style={{ flexGrow: 1, maxWidth: '360px' }}>
                      <label htmlFor="test-select-admin" style={{ fontSize: '12px', fontWeight: '700' }}>Select Weekend Test</label>
                      <select 
                        id="test-select-admin"
                        className="select-filter"
                        style={{ width: '100%', marginTop: '6px' }}
                        value={selectedTestName}
                        onChange={(e) => {
                          setSelectedTestName(e.target.value);
                          const mt = tests.find(t => t.name === e.target.value);
                          if (mt) setSelectedGrade(mt.grade || 'Grade 10');
                        }}
                      >
                        {tests.length === 0 ? (
                          <option value="">No assessment slots available</option>
                        ) : (
                          tests.map((t, idx) => (
                            <option key={idx} value={t.name}>{t.name} ({t.grade} - {t.subject})</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  {selectedTestName ? (
                    <div>
                      <div className="grades-test-banner">
                        <div className="grades-test-title">
                          <h4>{selectedTestName}</h4>
                          <p>
                            Target: {tests.find(t => t.name === selectedTestName)?.grade || ''} • 
                            Subject: {tests.find(t => t.name === selectedTestName)?.subject || ''} • 
                            Date: {tests.find(t => t.name === selectedTestName)?.date || ''} • 
                            Max Marks: {tests.find(t => t.name === selectedTestName)?.maxMarks || 50}
                          </p>
                        </div>
                        <button className="btn-cta-primary" style={{ padding: '10px 20px', fontSize: '14px' }} onClick={handleSaveMarks}>
                          <Save size={16} /> Save Score Sheet
                        </button>
                      </div>

                      <div className="grade-entry-list">
                        {students
                          .filter(s => {
                            const currentTest = tests.find(t => t.name === selectedTestName);
                            if (!currentTest) return true;
                            return s.class_grade === currentTest.grade;
                          })
                          .map((student) => (
                            <div className="grade-entry-row" key={student.id}>
                              <div>
                                <div style={{ fontWeight: '600' }}>{student.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {student.id} | {student.class_grade}</div>
                              </div>
                              
                              <div className="grade-input-score">
                                <input 
                                  aria-label={`Marks for ${student.name}`}
                                  className="grade-input-box" 
                                  type="number"
                                  min="0"
                                  max={tests.find(t => t.name === selectedTestName)?.maxMarks || 50}
                                  value={marksToSave[student.id]?.score || ''}
                                  onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                />
                                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                                  / {tests.find(t => t.name === selectedTestName)?.maxMarks || 50}
                                </span>
                              </div>

                              <div style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600' }}>
                                {marksToSave[student.id]?.score !== '' && marksToSave[student.id]?.score !== undefined ? (
                                  Math.round((Number(marksToSave[student.id].score) / (tests.find(t => t.name === selectedTestName)?.maxMarks || 50)) * 100) + '%'
                                ) : (
                                  'Ungraded'
                                )}
                              </div>

                              <input 
                                aria-label={`Teacher comments for ${student.name}`}
                                className="grade-comment-box" 
                                placeholder="Add teacher comments..." 
                                type="text"
                                value={marksToSave[student.id]?.comments || ''}
                                onChange={(e) => handleCommentChange(student.id, e.target.value)}
                              />
                            </div>
                          ))}

                        {students.filter(s => {
                          const currentTest = tests.find(t => t.name === selectedTestName);
                          if (!currentTest) return true;
                          return s.class_grade === currentTest.grade;
                        }).length === 0 && (
                          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
                            No active students enrolled in this test's grade class.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      Please create a weekend test slot to log grades.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. ATTENDANCE LOG TAB PANEL */}
          {activeAdminTab === 'attendance' && (
            <div className="dashboard-card">
              <div className="card-header-actions">
                <h3>Roll Call attendance sheet</h3>
                <button className="btn-cta-primary" style={{ padding: '10px 20px', fontSize: '14px' }} onClick={handleSaveAttendance}>
                  <Save size={16} /> Submit Attendance Roll
                </button>
              </div>

              {/* Date Filter */}
              <div className="toolbar-filters" style={{ marginBottom: '24px' }}>
                <div className="form-group" style={{ flexGrow: 1, maxWidth: '240px' }}>
                  <label htmlFor="attendance-date-select" style={{ fontSize: '12px', fontWeight: '700' }}>Session Date</label>
                  <input 
                    id="attendance-date-select"
                    className="select-filter" 
                    style={{ width: '100%', marginTop: '6px' }}
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Student Roll Call list */}
              <div className="attendance-roll-grid">
                {students.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
                    No students active in the registry.
                  </p>
                ) : (
                  students.map((student) => (
                    <div className="attendance-roll-row" key={student.id}>
                      <div className="student-roll-name">
                        <h4>{student.name}</h4>
                        <p>{student.id} | {student.class_grade}</p>
                      </div>

                      <div className="attendance-options-toggle">
                        <button 
                          className={`toggle-option-btn ${attendanceRecords[student.id]?.status === 'Present' ? 'present-active' : ''}`}
                          onClick={() => handleSetStudentAttendance(student.id, 'Present')}
                          type="button"
                        >
                          Present
                        </button>
                        <button 
                          className={`toggle-option-btn ${attendanceRecords[student.id]?.status === 'Late' ? 'late-active' : ''}`}
                          onClick={() => handleSetStudentAttendance(student.id, 'Late')}
                          type="button"
                        >
                          Late
                        </button>
                        <button 
                          className={`toggle-option-btn ${attendanceRecords[student.id]?.status === 'Absent' ? 'absent-active' : ''}`}
                          onClick={() => handleSetStudentAttendance(student.id, 'Absent')}
                          type="button"
                        >
                          Absent
                        </button>
                      </div>

                      <input 
                        aria-label={`Attendance remarks for ${student.name}`}
                        className="grade-comment-box" 
                        placeholder="Add absence remarks (e.g. sick leave)..." 
                        style={{ width: '100%' }}
                        type="text"
                        value={attendanceRecords[student.id]?.remarks || ''}
                        onChange={(e) => handleAttendanceRemarksChange(student.id, e.target.value)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 4. FEES LEDGER TAB PANEL */}
          {activeAdminTab === 'fees' && (
            <div className="dashboard-card">
              <div className="card-header-actions">
                <h3>Tuition Fees Audit Ledger</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Total Collected: <strong style={{ color: 'var(--paid)' }}>₹{stats.totalFeesCollected}</strong> | Total Pending: <strong style={{ color: 'var(--pending)' }}>₹{stats.totalFeesPending}</strong>
                </span>
              </div>

              <div className="table-scroll-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Parent Name</th>
                      <th>Monthly Fee</th>
                      <th>Current status</th>
                      <th>Submission / Paid Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                          No students listed in fee ledger.
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => (
                        <tr key={student.id}>
                          <td style={{ fontWeight: '700' }}>{student.id}</td>
                          <td style={{ fontWeight: '600' }}>{student.name}</td>
                          <td>{student.parent_name}</td>
                          <td style={{ fontWeight: '700' }}>₹{student.fees_amount}</td>
                          <td>
                            <span className={student.fees_status === 'Paid' ? 'badge badge-paid' : 'badge badge-pending'}>
                              {student.fees_status}
                            </span>
                          </td>
                          <td style={{ fontWeight: '600', color: student.fees_status === 'Paid' ? 'var(--paid)' : 'var(--text-muted)' }}>
                            {student.fees_status === 'Paid' ? (student.fees_paid_date || 'N/A') : '—'}
                          </td>
                          <td>
                            <button 
                              className="btn-action-secondary fees-toggle-action"
                              onClick={() => handleToggleFees(student.id, student.fees_status)}
                              type="button"
                            >
                              Toggle {student.fees_status === 'Paid' ? 'Pending' : 'Paid'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: ADD STUDENT DIALOG */}
      {isAddStudentOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Create Student Account</h3>
              <button className="modal-close-btn" onClick={() => setIsAddStudentOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddStudent}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* ID Fields with Generator */}
                <div className="form-group">
                  <label htmlFor="modal-student-id">Student ID (Unique)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      id="modal-student-id"
                      className="input-field" 
                      placeholder="e.g. SA-005"
                      style={{ paddingLeft: '16px' }}
                      value={newStudent.id}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, id: e.target.value }))}
                      required
                      type="text"
                    />
                    <button 
                      className="btn-action-secondary" 
                      onClick={handleAutoGenerateId}
                      type="button"
                    >
                      Auto
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="modal-student-name">Student Full Name</label>
                  <input 
                    id="modal-student-name"
                    className="input-field" 
                    placeholder="e.g. Clark Kent"
                    style={{ paddingLeft: '16px' }}
                    value={newStudent.name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                    required
                    type="text"
                  />
                </div>

                {/* Password field */}
                <div className="form-group">
                  <label htmlFor="modal-student-password">Student Portal Password</label>
                  <input 
                    id="modal-student-password"
                    className="input-field" 
                    placeholder="Set account password"
                    style={{ paddingLeft: '16px' }}
                    value={newStudent.password}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, password: e.target.value }))}
                    required
                    type="text"
                  />
                </div>

                <div className="grid-2col">
                  <div className="form-group">
                    <label htmlFor="modal-student-class">Grade</label>
                    <select 
                      id="modal-student-class"
                      className="select-filter"
                      value={newStudent.class_grade}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, class_grade: e.target.value }))}
                    >
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-student-fee">Monthly Fees (₹)</label>
                    <input 
                      id="modal-student-fee"
                      className="input-field" 
                      min="0"
                      style={{ paddingLeft: '16px' }}
                      type="number"
                      value={newStudent.fees_amount}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, fees_amount: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="modal-student-parent">Parent Name</label>
                  <input 
                    id="modal-student-parent"
                    className="input-field" 
                    placeholder="e.g. Martha Kent"
                    style={{ paddingLeft: '16px' }}
                    value={newStudent.parent_name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, parent_name: e.target.value }))}
                    type="text"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modal-student-contact">Contact Number</label>
                  <input 
                    id="modal-student-contact"
                    className="input-field" 
                    placeholder="e.g. +1 555-0155"
                    style={{ paddingLeft: '16px' }}
                    value={newStudent.contact_number}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, contact_number: e.target.value }))}
                    type="text"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modal-student-status">Tuition Fees Status</label>
                  <select 
                    id="modal-student-status"
                    className="select-filter"
                    value={newStudent.fees_status}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, fees_status: e.target.value }))}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="modal-student-joindate">Join Date</label>
                  <input 
                    id="modal-student-joindate"
                    className="select-filter" 
                    type="date"
                    value={newStudent.join_date}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, join_date: e.target.value }))}
                    required
                  />
                </div>

              </div>
              
              <div className="modal-footer">
                <button className="btn-action-secondary" onClick={() => setIsAddStudentOpen(false)} type="button">
                  Cancel
                </button>
                <button className="btn-cta-primary" style={{ padding: '8px 16px', fontSize: '14px' }} type="submit">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE TEST DIALOG */}
      {isCreateTestOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Create Assessment Slot</h3>
              <button className="modal-close-btn" onClick={() => setIsCreateTestOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleCreateTest}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="modal-test-name">Test / Title Name</label>
                  <input 
                    id="modal-test-name"
                    className="input-field" 
                    placeholder="e.g. Trigonometry Weekly Test"
                    style={{ paddingLeft: '16px' }}
                    value={selectedTestName}
                    onChange={(e) => setSelectedTestName(e.target.value)}
                    required
                    type="text"
                  />
                </div>

                <div className="grid-2col">
                  <div className="form-group">
                    <label htmlFor="modal-test-grade">Target Grade</label>
                    <select 
                      id="modal-test-grade"
                      className="select-filter"
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                    >
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-test-subject">Test Subject</label>
                    <select 
                      id="modal-test-subject"
                      className="select-filter"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                      <option value="Tamil">Tamil</option>
                      <option value="English">English</option>
                      <option value="Maths">Maths</option>
                      <option value="Science">Science</option>
                      <option value="Social Science">Social Science</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Economic">Economic</option>
                      <option value="Computer Application">Computer Application</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Bio-zoology">Bio-zoology</option>
                      <option value="bio-botany">bio-botany</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2col">
                  <div className="form-group">
                    <label htmlFor="modal-test-max">Max Marks</label>
                    <input 
                      id="modal-test-max"
                      className="input-field" 
                      min="1"
                      style={{ paddingLeft: '16px' }}
                      type="number"
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-test-date">Test Date</label>
                    <input 
                      id="modal-test-date"
                      className="select-filter"
                      type="date"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn-action-secondary" onClick={() => setIsCreateTestOpen(false)} type="button">
                  Cancel
                </button>
                <button className="btn-cta-primary" style={{ padding: '8px 16px', fontSize: '14px' }} type="submit">
                  Generate Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
