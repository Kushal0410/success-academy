import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import PerformanceChart from './PerformanceChart';
import { User, Calendar, CreditCard, Award, ChevronRight, FileText, CheckCircle2, AlertCircle, MessageCircleQuestionMark, LucideMessageCircleQuestion, FileQuestion, File } from 'lucide-react';

export default function StudentDashboard({ student, onLogout }) {
  const [studentDetails, setStudentDetails] = useState(student);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePortalTab, setActivePortalTab] = useState('marks');

  useEffect(() => {
    async function loadStudentData() {
      try {
        setLoading(true);
        const [marksData, attendanceData, allStudents] = await Promise.all([
          db.getMarks(student.id),
          db.getAttendance(student.id),
          db.getStudents()
        ]);
        setMarks(marksData);
        setAttendance(attendanceData);
        
        const latest = allStudents.find(s => s.id === student.id);
        if (latest) {
          setStudentDetails(latest);
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, [student.id]);

  // Compute metrics
  const totalTests = marks.length;
  const averagePercentage = totalTests > 0 
    ? Math.round(marks.reduce((sum, m) => sum + (m.marks_obtained / m.total_marks) * 100, 0) / totalTests) 
    : 0;

  const totalClasses = attendance.length;
  const presentClasses = attendance.filter(a => a.status === 'Present').length;
  const lateClasses = attendance.filter(a => a.status === 'Late').length;
  const absentClasses = attendance.filter(a => a.status === 'Absent').length;
  
  // 5 Lates = 1 Absent penalty
  const adjustedAbsents = absentClasses + Math.floor(lateClasses / 5);
  const attendanceRate = totalClasses > 0 ? Math.max(0, Math.round(((totalClasses - adjustedAbsents) / totalClasses) * 100)) : 100;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <h3>Loading student records...</h3>
      </div>
    );
  }

  return (
    <div className="portal-container">
      <div className="portal-wrapper">
        {/* Sidebar */}
        <aside className="portal-sidebar">
          <ul className="sidebar-menu">
            <li>
              <button 
                className={`sidebar-btn ${activePortalTab === 'marks' ? 'active' : ''}`}
                onClick={() => setActivePortalTab('marks')}
              >
                <Award size={18} />
                Weekend Marks
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-btn ${activePortalTab === 'attendance' ? 'active' : ''}`}
                onClick={() => setActivePortalTab('attendance')}
              >
                <Calendar size={18} />
                Attendance Log
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-btn ${activePortalTab === 'fees' ? 'active' : ''}`}
                onClick={() => setActivePortalTab('fees')}
              >
                <CreditCard size={18} />
                Tuition Fees
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-btn ${activePortalTab === 'Q/P' ? 'active' : ''}`}
                onClick={() => setActivePortalTab('Q/P')}
              >
                <File size={18} />
                Previous Year Question Papers
              </button>
            </li>
          </ul>

          <div className="sidebar-footer">
            <button className="sidebar-btn" style={{ color: 'var(--absent)' }} onClick={onLogout}>
              Logout Portal
            </button>
          </div>
        </aside>

        {/* Main Dashboard Content */}
        <main className="portal-content">
          {/* Profile Header Banner */}
          <div className="profile-banner">
            <div className="profile-avatar-info">
              <div className="profile-avatar">
                <User size={30} />
              </div>
              <div className="profile-name-id">
                <h2>{studentDetails.name}</h2>
                <p>Student ERP Portal • ID: {studentDetails.id}</p>
              </div>
            </div>
            
            <div className="profile-meta-grid">
              <div className="profile-meta-item">
                <span>Grade</span>
                <p>{studentDetails.class_grade}</p>
              </div>
              <div className="profile-meta-item">
                <span>Parent Name</span>
                <p>{studentDetails.parent_name}</p>
              </div>
              <div className="profile-meta-item">
                <span>Emergency Contact</span>
                <p>{studentDetails.contact_number}</p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="stats-cards-grid">
            <div className="stat-scorecard">
              <div className="stat-scorecard-info">
                <span>Fee Ledger Status</span>
                <h3 style={{ color: studentDetails.fees_status === 'Paid' ? 'var(--paid)' : 'var(--pending)' }}>
                  {studentDetails.fees_status}
                </h3>
              </div>
              <div className={`stat-scorecard-icon ${studentDetails.fees_status === 'Paid' ? 'success-color' : 'warning-color'}`}>
                <CreditCard size={24} />
              </div>
            </div>

            <div className="stat-scorecard">
              <div className="stat-scorecard-info">
                <span>Attendance Rate</span>
                <h3>{attendanceRate}%</h3>
              </div>
              <div className="stat-scorecard-icon accent-color">
                <Calendar size={24} />
              </div>
            </div>

            <div className="stat-scorecard">
              <div className="stat-scorecard-info">
                <span>Average Grade</span>
                <h3>{averagePercentage}%</h3>
              </div>
              <div className="stat-scorecard-icon">
                <Award size={24} />
              </div>
            </div>
          </div>

          {/* 1. Marks Tab Panel */}
          {activePortalTab === 'marks' && (
            <div>
              {/* Table Ledger */}
              <div className="dashboard-card">
                <div className="card-header-actions">
                  <h3>Weekend Test Ledger</h3>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Total Tests Completed: {totalTests}
                  </span>
                </div>

                <div className="table-scroll-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Test Title</th>
                        <th>Subject</th>
                        <th>Marks Obtained</th>
                        <th>Percentage</th>
                        <th>Teacher Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marks.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                            No tests recorded yet.
                          </td>
                        </tr>
                      ) : (
                        [...marks]
                          .sort((a, b) => new Date(b.test_date) - new Date(a.test_date))
                          .map((mark) => {
                            const pct = Math.round((mark.marks_obtained / mark.total_marks) * 100);
                            return (
                              <tr key={mark.id}>
                                <td style={{ fontWeight: '600' }}>{mark.test_date}</td>
                                <td>{mark.test_name}</td>
                                <td>{mark.subject}</td>
                                <td style={{ fontWeight: '700' }}>
                                  {mark.marks_obtained} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>/ {mark.total_marks}</span>
                                </td>
                                <td>
                                  <span style={{ 
                                    color: pct >= 80 ? 'var(--paid)' : pct >= 50 ? 'var(--accent)' : 'var(--absent)', 
                                    fontWeight: '700' 
                                  }}>
                                    {pct}%
                                  </span>
                                </td>
                                <td style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                  "{mark.comments || 'Good progress.'}"
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. Attendance Tab Panel */}
          {activePortalTab === 'attendance' && (
            <div className="dashboard-card">
              <div className="card-header-actions">
                <h3>Attendance Ledger</h3>
                <span>
                  Present: {presentClasses} | Late: {lateClasses} | Absent: {absentClasses} (Rate: {attendanceRate}%)
                </span>
              </div>
              
              {lateClasses > 0 && (
                <div style={{
                  backgroundColor: 'var(--pending-bg)',
                  border: '1px solid var(--pending)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '13.5px',
                  color: 'var(--text-primary)'
                }}>
                  ⚠️ **Attendance Rule Alert:** 5 Late entries result in 1 Absent day. 
                  You have **{lateClasses} Late** counts, resulting in **{Math.floor(lateClasses / 5)}** adjusted Absent days.
                </div>
              )}

              <div className="attendance-timeline">
                {attendance.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
                    No class attendance logged yet.
                  </p>
                ) : (
                  [...attendance]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((item) => (
                      <div 
                        className={`timeline-item ${item.status === 'Absent' ? 'timeline-absent' : item.status === 'Late' ? 'timeline-late' : ''}`} 
                        key={item.id}
                      >
                        <div className="timeline-date-info">
                          <div className="timeline-dot" />
                          <span className="timeline-date">{item.date}</span>
                          {item.remarks && (
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: '12px' }}>
                              — {item.remarks}
                            </span>
                          )}
                        </div>
                        <div className={`timeline-status ${
                          item.status === 'Present' ? 'present-text' : 
                          item.status === 'Late' ? 'late-text' : 'absent-text'
                        }`}>
                          {item.status}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* 3. Tuition Fees Tab Panel */}
          {activePortalTab === 'fees' && (
            <div className="dashboard-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div>
                <h3 style={{ marginBottom: '16px' }}>Tuition Fee Invoice</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Your current billing and payment status for Success Academy tuition.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Status:</div>
                  <span className={studentDetails.fees_status === 'Paid' ? 'badge badge-paid' : 'badge badge-pending'}>
                    {studentDetails.fees_status === 'Paid' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {studentDetails.fees_status}
                  </span>
                </div>

                <div style={{ display: 'flex', justifySelf: 'flex-start', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: '800' }}>₹{studentDetails.fees_amount}</span>
                  <span style={{ color: 'var(--text-muted)' }}>/ month</span>
                </div>

                {studentDetails.fees_status === 'Paid' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>Submission / Paid Date:</div>
                    <span style={{ fontWeight: '700', color: 'var(--paid)', fontSize: '15px' }}>
                      {studentDetails.fees_paid_date || 'N/A'}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                {studentDetails.fees_status === 'Paid' ? (
                  <p style={{ color: 'var(--paid)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> Thank you! Your tuition fees are fully settled.
                  </p>
                ) : (
                  <p style={{ color: 'var(--pending)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={16} /> Pending Payment. Please settle as soon as possible.
                  </p>
                )}
              </div>
            </div>
          )}

          {activePortalTab === 'Q/P' && (
            <div className="dashboard-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              
            <h3 style={{ marginBottom: '16px' ,textAlign:'center'}}><a href="https://scorehigh.netlify.app"><span style={{color:'red'}}>Click Here </span></a> <br />for previous year question papers</h3>
              
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
