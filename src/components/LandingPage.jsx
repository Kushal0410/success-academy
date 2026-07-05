import React from 'react';
import { ArrowRight, BookOpen, Clock, ShieldCheck, Award, Star, Phone, Mail, MapPin } from 'lucide-react';

export default function LandingPage({ setActiveTab }) {
  return (
    <div>
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-shapes">
          <div className="hero-shape-1"></div>
          <div className="hero-shape-2"></div>
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="hero-title">
            Unlock Academic Excellence with <span>Success Academy</span>
          </h1>
          <p className="hero-desc">
            Empowering students to achieve outstanding results through personalized coaching, real-time progress tracking, and structured weekend assessments.
          </p>
          <div className="hero-actions">
            <button className="btn-cta-primary" onClick={() => setActiveTab('login')}>
              Access Student Portal <ArrowRight size={18} />
            </button>
            <button className="btn-cta-secondary" onClick={() => setActiveTab('features')}>
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="stats-ribbon">
        <div className="container">
          <div className="ribbon-grid">
            <div className="ribbon-item">
              <div className="ribbon-number">98%</div>
              <div className="ribbon-label">Success Rate</div>
            </div>
            <div className="ribbon-item">
              <div className="ribbon-number">20+</div>
              <div className="ribbon-label">Years Coaching</div>
            </div>
            <div className="ribbon-item">
              <div className="ribbon-number">500+</div>
              <div className="ribbon-label">Students Guided</div>
            </div>
            <div className="ribbon-item">
              <div className="ribbon-number">99.9%</div>
              <div className="ribbon-label">Parent Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Tuition Features</div>
            <h2 className="section-title">Designed for Consistent Academic Growth</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              We don't just teach. We measure, audit, and support students closely, keeping parents completely aligned with performance.
            </p>
          </div>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <BookOpen size={28} />
              </div>
              <h3>Weekend Test Marks</h3>
              <p>
                Weekly practice assessments simulate exam scenarios. Marks are uploaded immediately to the portal, accompanied by teacher feedback and diagnostic progress charts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Clock size={28} />
              </div>
              <h3>Attendance Tracking</h3>
              <p>
                Strict attendance monitoring ensures consistent study habits. Parents can instantly audit presence logs, excused absence remarks, and session history in their ERP portal.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={28} />
              </div>
              <h3>Secure ERP Portal</h3>
              <p>
                Parents use the student's unique ID and password to access a private, secure dashboard. Students only see their own individual data, keeping metrics confidential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={{ padding: '100px 0', background: 'radial-gradient(circle at 10% 20%, hsla(var(--hue-primary), 60%, 15%, 0.12) 0%, transparent 60%)' }} id="about">
        <div className="container">
          <div className="grid-2col" style={{ alignItems: 'center' }}>
            <div style={{ paddingRight: '20px' }}>
              <div className="section-tag" style={{ textAlign: 'left' }}>About Success Academy</div>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '24px' }}>
                Dedicated to Individual Potential & Mentorship
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '18px' }}>
                Success Academy is built upon the premise that every student can excel with the right methodology and feedback. We specialize in Mathematics, Physics, and Chemistry for secondary school levels.
              </p>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                Our digital infrastructure bridges the gap between tuition classes and home. By offering transparent metrics, we help parents actively monitor their child's tuition engagement and academic success without manual paperwork.
              </p>
              <button className="btn-cta-primary" onClick={() => setActiveTab('login')}>
                Get Started Today <ArrowRight size={16} />
              </button>
            </div>
            
            {/* Visual element representing academy */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(28, 169, 201, 0.1) 0%, rgba(28, 169, 201, 0.03) 100%)',
              border: '1px solid var(--border-glow)',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              position: 'relative'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                💡 Teaching Philosophy
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '20px' }}>01</span>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Micro-Concept Learning</h4>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Breaking complex science and maths equations into digestible logic blocks.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '20px' }}>02</span>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Constant Evaluation</h4>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Using weekly checkpoints to locate learning gaps before school examinations.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '20px' }}>03</span>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Parent-Teacher Coordination</h4>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Instantly synchronizing fees status, attendance sheets, and grades.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    
      

      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h3>Success Academy</h3>
              <p>Dedicated to helping students secure top-tier marks and build confidence in scientific and mathematical disciplines.</p>
            </div>
            <div className="footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}>Home</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('login'); }}>Portal Login</a></li>
              </ul>
            </div>
            <div className="footer-contact">
              <h4>Contact Us</h4>
              <ul>
                <li><MapPin size={16} /> No 45, Bajana Koil 3rd St, Veppambattu, perumalpatu, Tamil Nadu 602024</li>
                <li><Phone size={16} /> +91 9381173259</li>
                <li><Mail size={16} /> Kushal@successacademy.edu</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Success Academy. All rights reserved.</p>
            <p style={{ display: 'flex', gap: '16px' }}>
              <a href="#" style={{ textDecoration: 'underline' }}>Privacy Policy</a>
              <a href="#" style={{ textDecoration: 'underline' }}>Terms of Use</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
