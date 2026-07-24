import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Instagram,
  Layers,
  MessageSquare,
  Plus,
  Phone,
  RefreshCw,
  Trash2,
  Users,
  Edit2,
  Sparkles,
  X,
  Save,
  Mail,
  Lock,
  LogOut,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  MessageCircle,
} from "lucide-react";
import {
  addCourse,
  addFAQ,
  deleteCourse,
  deleteFAQ,
  deleteLead,
  getAdminAuth,
  getContacts,
  getCourses,
  getFAQs,
  getLeads,
  logoutAdmin,
  resetStoreToDefaults,
  saveContacts,
  updateAdminCredentials,
  updateCourse,
  updateLeadStatus,
} from "../services/store";

export function AdminDashboard({ onReturnToUser }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [courses, setCourses] = useState(getCourses());
  const [faqs, setFaqs] = useState(getFAQs());
  const [leads, setLeads] = useState(getLeads());
  const [contacts, setContactsState] = useState(getContacts());
  const [adminAuth, setAdminAuthState] = useState(getAdminAuth());

  // Form states for adding/editing courses
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    level: "Beginner",
    duration: "8 weeks",
    description: "",
    modules: 20,
    rating: "4.9",
    accent: "violet",
  });

  // Form state for adding FAQ
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });

  // Contact form state
  const [contactForm, setContactForm] = useState(contacts);
  const [savedSettingsMsg, setSavedSettingsMsg] = useState("");

  // Security form state
  const [securityForm, setSecurityForm] = useState({
    gmail: adminAuth.gmail,
    newPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [securityMsg, setSecurityMsg] = useState("");

  const refreshState = () => {
    setCourses(getCourses());
    setFaqs(getFAQs());
    setLeads(getLeads());
    setContactsState(getContacts());
    setAdminAuthState(getAdminAuth());
  };

  const handleLogout = () => {
    logoutAdmin();
    onReturnToUser();
  };

  const handleOpenAddCourse = () => {
    setEditingCourseId(null);
    setCourseForm({
      title: "",
      level: "Beginner",
      duration: "8 weeks",
      description: "",
      modules: 20,
      rating: "4.9",
      accent: "violet",
    });
    setShowCourseModal(true);
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title,
      level: course.level,
      duration: course.duration,
      description: course.description,
      modules: course.modules,
      rating: course.rating,
      accent: course.accent || "violet",
    });
    setShowCourseModal(true);
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) return;

    if (editingCourseId) {
      updateCourse(editingCourseId, courseForm);
    } else {
      addCourse(courseForm);
    }
    setShowCourseModal(false);
    refreshState();
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      deleteCourse(id);
      refreshState();
    }
  };

  const handleSaveFaq = (e) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return;
    addFAQ(faqForm);
    setFaqForm({ question: "", answer: "" });
    setShowFaqModal(false);
    refreshState();
  };

  const handleDeleteFaq = (id) => {
    deleteFAQ(id);
    refreshState();
  };

  const handleStatusChange = (id, newStatus) => {
    updateLeadStatus(id, newStatus);
    refreshState();
  };

  const handleDeleteLead = (id) => {
    deleteLead(id);
    refreshState();
  };

  const handleSaveContacts = (e) => {
    e.preventDefault();
    saveContacts(contactForm);
    refreshState();
    setSavedSettingsMsg("Contact settings updated successfully!");
    setTimeout(() => setSavedSettingsMsg(""), 3000);
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    if (!securityForm.gmail.includes("@")) {
      setSecurityMsg("Please enter a valid Gmail address.");
      return;
    }
    updateAdminCredentials(securityForm.gmail, securityForm.newPassword);
    refreshState();
    setSecurityMsg("Admin credentials updated with bcrypt security!");
    setSecurityForm({ ...securityForm, newPassword: "" });
    setTimeout(() => setSecurityMsg(""), 3000);
  };

  const handleResetData = () => {
    if (window.confirm("Reset all courses, leads, FAQs and auth to default initial data?")) {
      resetStoreToDefaults();
      refreshState();
      setContactForm(getContacts());
      setSecurityForm({ gmail: "prashant@gmail.com", newPassword: "" });
    }
  };

  const pendingLeadsCount = leads.filter((l) => l.status === "Pending").length;
  const contactedLeadsCount = leads.filter((l) => l.status === "Contacted").length;

  return (
    <div className="admin-container">
      {/* Top Header Bar */}
      <header className="admin-header">
        <div className="admin-header__brand">
          <span className="admin-badge">
            <Shield size={15} /> Authenticated Admin Console
          </span>
          <h1>Skill.Nova Portal ({adminAuth.gmail})</h1>
        </div>
        <div className="admin-header__actions">
          <button className="button button--small button--outline" onClick={handleResetData} type="button">
            <RefreshCw size={14} /> Reset Demo Data
          </button>
          <button className="button button--small button--outline" onClick={handleLogout} type="button">
            <LogOut size={14} /> Logout
          </button>
          <button className="button button--small" onClick={onReturnToUser} type="button">
            View Live Website →
          </button>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <nav className="admin-tabs">
        <button
          className={activeTab === "overview" ? "admin-tab is-active" : "admin-tab"}
          onClick={() => setActiveTab("overview")}
          type="button"
        >
          <Layers size={16} /> Overview
        </button>
        <button
          className={activeTab === "courses" ? "admin-tab is-active" : "admin-tab"}
          onClick={() => setActiveTab("courses")}
          type="button"
        >
          <BookOpen size={16} /> Courses ({courses.length})
        </button>
        <button
          className={activeTab === "leads" ? "admin-tab is-active" : "admin-tab"}
          onClick={() => setActiveTab("leads")}
          type="button"
        >
          <MessageCircle size={16} /> Student Queries ({leads.length})
          {pendingLeadsCount > 0 && <span className="admin-tab__pill">{pendingLeadsCount} new</span>}
        </button>
        <button
          className={activeTab === "faqs" ? "admin-tab is-active" : "admin-tab"}
          onClick={() => setActiveTab("faqs")}
          type="button"
        >
          <MessageSquare size={16} /> FAQs ({faqs.length})
        </button>
        <button
          className={activeTab === "settings" ? "admin-tab is-active" : "admin-tab"}
          onClick={() => setActiveTab("settings")}
          type="button"
        >
          <Phone size={16} /> Contact Links
        </button>
        <button
          className={activeTab === "security" ? "admin-tab is-active" : "admin-tab"}
          onClick={() => setActiveTab("security")}
          type="button"
        >
          <Lock size={16} /> Security & Auth
        </button>
      </nav>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="admin-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card__icon stat-card__icon--violet">
                <BookOpen size={24} />
              </div>
              <div>
                <h3>{courses.length}</h3>
                <p>Published Courses</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon stat-card__icon--orange">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3>{pendingLeadsCount}</h3>
                <p>New Student Queries</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon stat-card__icon--mint">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3>{contactedLeadsCount}</h3>
                <p>Responded Queries</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon stat-card__icon--blue">
                <Shield size={24} />
              </div>
              <div>
                <h3>Bcrypt Secured</h3>
                <p>Admin: {adminAuth.gmail}</p>
              </div>
            </div>
          </div>

          <div className="admin-two-col">
            <div className="admin-card">
              <div className="admin-card__header">
                <h2>Quick Actions</h2>
              </div>
              <div className="quick-actions-list">
                <button className="admin-btn-action" onClick={handleOpenAddCourse} type="button">
                  <Plus size={18} /> Upload New Course
                </button>
                <button className="admin-btn-action" onClick={() => setActiveTab("leads")} type="button">
                  <MessageCircle size={18} /> View Student Queries ({leads.length})
                </button>
                <button className="admin-btn-action" onClick={() => setActiveTab("security")} type="button">
                  <KeyRound size={18} /> Update Admin Password / Email
                </button>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card__header">
                <h2>Active Contact Info</h2>
              </div>
              <div className="contacts-preview">
                <p>
                  <strong>Admin Gmail:</strong> {adminAuth.gmail}
                </p>
                <p>
                  <strong>WhatsApp Number:</strong> {contacts.phone}
                </p>
                <p>
                  <strong>WhatsApp Link:</strong>{" "}
                  <a href={contacts.whatsapp} target="_blank" rel="noopener noreferrer">
                    {contacts.whatsapp}
                  </a>
                </p>
                <p>
                  <strong>Instagram Profile:</strong>{" "}
                  <a href={contacts.instagram} target="_blank" rel="noopener noreferrer">
                    {contacts.instagram}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COURSES MANAGEMENT */}
      {activeTab === "courses" && (
        <div className="admin-section">
          <div className="admin-section__header">
            <div>
              <h2>Course Catalog ({courses.length})</h2>
              <p>Add, edit, or remove courses published on the website.</p>
            </div>
            <button className="button" onClick={handleOpenAddCourse} type="button">
              <Plus size={16} /> Upload New Course
            </button>
          </div>

          <div className="admin-courses-grid">
            {courses.map((course) => (
              <div className="admin-course-card" key={course.id}>
                <div className={`admin-course-card__badge accent--${course.accent || "violet"}`}>
                  {course.level} • {course.duration}
                </div>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="admin-course-card__meta">
                  <span>{course.modules} Modules</span>
                  <span>Rating: {course.rating} ⭐</span>
                </div>
                <div className="admin-course-card__actions">
                  <button className="btn-icon" onClick={() => handleOpenEditCourse(course)} title="Edit course" type="button">
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="btn-icon btn-icon--danger" onClick={() => handleDeleteCourse(course.id)} title="Delete course" type="button">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COUNSELLING LEADS & USER QUERIES */}
      {activeTab === "leads" && (
        <div className="admin-section">
          <div className="admin-section__header">
            <div>
              <h2>Student Queries & Counselling Applications ({leads.length})</h2>
              <p>Direct queries and form submissions from students with messages.</p>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Contact Info</th>
                  <th>Track & Level</th>
                  <th>Student Query / Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
                      No student queries submitted yet.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <strong>{lead.fullName}</strong>
                      </td>
                      <td>
                        <div className="contact-cell">
                          <a href={`tel:${lead.phone}`} className="phone-link">
                            <Phone size={13} /> {lead.phone}
                          </a>
                          <a href={`mailto:${lead.email}`} className="email-link">
                            <Mail size={13} /> {lead.email}
                          </a>
                        </div>
                      </td>
                      <td>
                        <span className="chip-track">{lead.track}</span>
                        <div className="small-text">{lead.level}</div>
                      </td>
                      <td>
                        <div className="query-box">
                          {lead.query ? (
                            <span>“{lead.query}”</span>
                          ) : (
                            <em className="no-query">No query message attached</em>
                          )}
                        </div>
                      </td>
                      <td>{lead.createdAt}</td>
                      <td>
                        <select
                          className={`status-select status--${lead.status.toLowerCase()}`}
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Enrolled">Enrolled</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn-icon btn-icon--danger" onClick={() => handleDeleteLead(lead.id)} type="button">
                          <Trash2 size={15} />
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

      {/* TAB 4: FAQs */}
      {activeTab === "faqs" && (
        <div className="admin-section">
          <div className="admin-section__header">
            <div>
              <h2>Frequently Asked Questions ({faqs.length})</h2>
              <p>Manage FAQs shown on the main page and answered by the AI bot.</p>
            </div>
            <button className="button" onClick={() => setShowFaqModal(true)} type="button">
              <Plus size={16} /> Add FAQ
            </button>
          </div>

          <div className="admin-faq-list">
            {faqs.map((faq) => (
              <div className="admin-faq-card" key={faq.id}>
                <div>
                  <h4>{faq.question}</h4>
                  <p>{faq.answer}</p>
                </div>
                <button className="btn-icon btn-icon--danger" onClick={() => handleDeleteFaq(faq.id)} type="button">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CONTACT & SOCIAL SETTINGS */}
      {activeTab === "settings" && (
        <div className="admin-section">
          <div className="admin-card admin-card--narrow">
            <h2>Contact & Social Media Settings</h2>
            <p>Update links and numbers across the website live.</p>

            {savedSettingsMsg && <div className="admin-alert admin-alert--success">{savedSettingsMsg}</div>}

            <form onSubmit={handleSaveContacts} className="admin-form">
              <label className="field">
                <span>Phone Number</span>
                <input
                  type="text"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="e.g. 7627043971"
                  required
                />
              </label>

              <label className="field">
                <span>WhatsApp Link</span>
                <input
                  type="text"
                  value={contactForm.whatsapp}
                  onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                  placeholder="https://wa.me/917627043971"
                  required
                />
              </label>

              <label className="field">
                <span>Instagram Profile URL</span>
                <input
                  type="text"
                  value={contactForm.instagram}
                  onChange={(e) => setContactForm({ ...contactForm, instagram: e.target.value })}
                  placeholder="https://www.instagram.com/prashant_singh_08__/"
                  required
                />
              </label>

              <label className="field">
                <span>Support Email</span>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="prashant@skillnova.edu"
                  required
                />
              </label>

              <button className="button" type="submit">
                <Save size={16} /> Save Contact Settings
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY & BCRYPTO AUTHENTICATION */}
      {activeTab === "security" && (
        <div className="admin-section">
          <div className="admin-card admin-card--narrow">
            <h2>Admin Account & Password Security</h2>
            <p>Change your designated Admin Gmail ID and Password. Passwords are hashed using <strong>bcryptjs</strong>.</p>

            {securityMsg && <div className="admin-alert admin-alert--success">{securityMsg}</div>}

            <form onSubmit={handleSaveSecurity} className="admin-form">
              <label className="field">
                <span>Admin Gmail Address</span>
                <input
                  type="email"
                  value={securityForm.gmail}
                  onChange={(e) => setSecurityForm({ ...securityForm, gmail: e.target.value })}
                  placeholder="prashant@gmail.com"
                  required
                />
              </label>

              <label className="field">
                <span>New Password (leave empty to keep existing password)</span>
                <div className="input-with-icon">
                  <input
                    type={showPass ? "text" : "password"}
                    value={securityForm.newPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                    placeholder="Enter new strong password"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="icon-toggle-btn">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <button className="button" type="submit">
                <KeyRound size={16} /> Update Admin Credentials
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT COURSE */}
      {showCourseModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h3>{editingCourseId ? "Edit Course" : "Upload New Course"}</h3>
              <button onClick={() => setShowCourseModal(false)} type="button">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveCourse} className="admin-modal__body">
              <label className="field">
                <span>Course Title</span>
                <input
                  type="text"
                  placeholder="e.g. Cloud & DevOps Engineering"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
              </label>
              <div className="field-row">
                <label className="field">
                  <span>Level</span>
                  <input
                    type="text"
                    placeholder="e.g. Beginner to Advanced"
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  <span>Duration</span>
                  <input
                    type="text"
                    placeholder="e.g. 12 weeks"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    required
                  />
                </label>
              </div>
              <label className="field">
                <span>Description</span>
                <textarea
                  rows="3"
                  placeholder="Course summary..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  required
                />
              </label>
              <div className="field-row">
                <label className="field">
                  <span>Number of Modules</span>
                  <input
                    type="number"
                    value={courseForm.modules}
                    onChange={(e) => setCourseForm({ ...courseForm, modules: parseInt(e.target.value) || 0 })}
                    required
                  />
                </label>
                <label className="field">
                  <span>Accent Theme</span>
                  <select
                    value={courseForm.accent}
                    onChange={(e) => setCourseForm({ ...courseForm, accent: e.target.value })}
                  >
                    <option value="violet">Violet</option>
                    <option value="mint">Mint</option>
                    <option value="orange">Orange</option>
                  </select>
                </label>
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="button button--outline" onClick={() => setShowCourseModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button">
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD FAQ */}
      {showFaqModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h3>Add New FAQ</h3>
              <button onClick={() => setShowFaqModal(false)} type="button">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveFaq} className="admin-modal__body">
              <label className="field">
                <span>Question</span>
                <input
                  type="text"
                  placeholder="e.g. Do I need prior coding experience?"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Answer</span>
                <textarea
                  rows="4"
                  placeholder="Detailed answer..."
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  required
                />
              </label>
              <div className="admin-modal__footer">
                <button type="button" className="button button--outline" onClick={() => setShowFaqModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button">
                  Add FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
