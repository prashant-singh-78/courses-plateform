import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  GraduationCap,
  Instagram,
  Laptop2,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircleMore,
  MessageSquare,
  Phone,
  Play,
  Quote,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import "./styles.css";
import { AdminDashboard } from "./components/AdminDashboard";
import { UserAuthModal } from "./components/UserAuthModal";
import { CourseViewerModal } from "./components/CourseViewerModal";
import {
  getContacts,
  getCourses,
  getFAQs,
  getStoredUser,
  isAdminLoggedIn,
  logoutAdmin,
  logoutUser,
  submitLead,
} from "./services/api";

const services = [
  {
    icon: Target,
    className: "path-card path-card--feature",
    eyebrow: "Personal roadmap",
    title: "A learning path built around your goal",
    description:
      "Tell us the role you want. We map the skills, courses, projects and weekly milestones you need to reach it.",
    bullets: [
      "Skill-gap assessment",
      "Weekly study plan",
      "Progress checkpoints",
      "Project recommendations",
    ],
    action: "Build my roadmap",
  },
  {
    icon: Users,
    className: "path-card path-card--small",
    title: "1:1 Mentor Sessions",
    description: "Get unstuck with focused guidance from working professionals.",
    action: "Meet mentors",
  },
  {
    icon: BriefcaseBusiness,
    className: "path-card path-card--small",
    title: "Career Preparation",
    description: "Resume reviews, mock interviews and a portfolio that stands out.",
    action: "Explore career prep",
  },
  {
    icon: Laptop2,
    className: "path-card path-card--small",
    title: "Hands-on Projects",
    description: "Build realistic products and publish proof of your skills.",
    action: "View projects",
  },
  {
    icon: Trophy,
    className: "path-card path-card--small path-card--mint",
    title: "Certificates",
    description: "Earn verified certificates after projects and assessments.",
    action: "How it works",
  },
];

function Logo({ compact = false }) {
  return (
    <a className={`brand ${compact ? "brand--compact" : ""}`} href="#top">
      <span className="brand__mark" aria-hidden="true">
        <span className="brand__orbit" />
        <Sparkles size={16} strokeWidth={2.4} />
      </span>
      <span className="brand__text">
        skill<span>.nova</span>
      </span>
    </a>
  );
}

function Header({ currentMode, onOpenAuthModal, currentUser, onUserLogout, onOpenAdminConsole }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Logo />
        <div className="nav-right-group">
          {currentUser ? (
            <div className="user-profile-badge">
              <User size={14} />
              <span>{currentUser.name}</span>
              <button
                className="btn-icon-sm"
                onClick={onUserLogout}
                title="Log out"
                type="button"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button className="button button--small" onClick={onOpenAuthModal} type="button">
              Sign In
            </button>
          )}

          <button
            className="menu-button"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={23} />}
          </button>
        </div>

        <nav className={menuOpen ? "main-nav is-open" : "main-nav"}>
          <a href="#courses" onClick={close}>
            Courses <ChevronDown size={14} />
          </a>
          <a href="#paths" onClick={close}>
            Learning paths <ChevronDown size={14} />
          </a>
          <a href="#outcomes" onClick={close}>
            Outcomes
          </a>
          <a href="#resources" onClick={close}>
            Resources <ChevronDown size={14} />
          </a>
          <a href="#contact" onClick={close}>
            Contact
          </a>
          <a className="button button--small" href="#contact" onClick={close}>
            Book free call
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__glow hero__glow--one" />
      <div className="hero__glow hero__glow--two" />
      <div className="container hero__grid">
        <div className="hero__content">
          <div className="eyebrow">
            <span>
              <Sparkles size={13} />
            </span>
            Learn skills that move your career
          </div>
          <h1>
            Learn boldly.
            <br />
            Build your <em>future.</em>
          </h1>
          <p>
            Mentor-guided courses, real projects and a clear roadmap—from your
            first lesson to your next big opportunity.
          </p>
          <div className="hero__actions">
            <a className="button" href="#courses">
              Explore courses <ArrowRight size={17} />
            </a>
            <a className="button button--outline" href="#paths">
              <span className="play-icon">
                <Play size={12} fill="currentColor" />
              </span>
              See how it works
            </a>
          </div>
          <div className="proof">
            <div className="avatar-stack">
              <span className="avatar avatar--one">AS</span>
              <span className="avatar avatar--two">RK</span>
              <span className="avatar avatar--three">NP</span>
              <span className="avatar avatar--four">+</span>
            </div>
            <div>
              <div className="proof__rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={13} fill="currentColor" />
                ))}
                <strong>4.9/5</strong>
              </div>
              <small>Rated by ambitious learners</small>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Skill.Nova learning dashboard preview">
          <div className="hero-visual__dots" />
          <div className="student-card">
            <div className="student-card__top">
              <div className="student-avatar">
                <span>PS</span>
              </div>
              <div>
                <small>Welcome back</small>
                <strong>Keep building, Prashant!</strong>
              </div>
              <span className="status-dot" />
            </div>
            <div className="course-progress">
              <div className="course-progress__header">
                <span className="mini-icon mini-icon--violet">
                  <Code2 size={17} />
                </span>
                <div>
                  <small>Current path</small>
                  <strong>Full-Stack Developer</strong>
                </div>
                <span className="course-progress__percent">72%</span>
              </div>
              <div className="progress-track">
                <span />
              </div>
              <div className="progress-meta">
                <span>Module 8 of 12</span>
                <span>18h learned</span>
              </div>
            </div>
            <div className="dashboard-grid">
              <div>
                <Zap size={19} />
                <strong>12 day</strong>
                <span>Learning streak</span>
              </div>
              <div>
                <Trophy size={19} />
                <strong>06</strong>
                <span>Projects built</span>
              </div>
            </div>
          </div>
          <div className="floating-note floating-note--top">
            <span className="mini-icon mini-icon--mint">
              <Users size={17} />
            </span>
            <div>
              <strong>120+</strong>
              <small>Expert mentors</small>
            </div>
          </div>
          <div className="floating-note floating-note--bottom">
            <span className="mini-icon mini-icon--orange">
              <Rocket size={17} />
            </span>
            <div>
              <small>Next milestone</small>
              <strong>Deploy your app</strong>
            </div>
          </div>
        </div>
      </div>
      <div className="container stats" id="outcomes">
        <div className="stat">
          <span className="stat__icon">
            <Users size={20} />
          </span>
          <div>
            <strong>10K+</strong>
            <small>Active learners</small>
          </div>
        </div>
        <div className="stat">
          <span className="stat__icon stat__icon--mint">
            <TrendingUp size={20} />
          </span>
          <div>
            <strong>92%</strong>
            <small>Course completion</small>
          </div>
        </div>
        <div className="stat">
          <span className="stat__icon stat__icon--orange">
            <Laptop2 size={20} />
          </span>
          <div>
            <strong>250+</strong>
            <small>Hands-on projects</small>
          </div>
        </div>
        <div className="stat">
          <span className="stat__icon stat__icon--blue">
            <GraduationCap size={20} />
          </span>
          <div>
            <strong>40+</strong>
            <small>Career-focused courses</small>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, description, centered = true }) {
  return (
    <div className={`section-heading ${centered ? "section-heading--center" : ""}`}>
      <span className="section-heading__eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function CourseCard({ course, onOpenCourse, onWhatsAppEnrol }) {
  const Icon = course.accent === "mint" ? BarChart3 : course.accent === "orange" ? Sparkles : Code2;
  return (
    <article className="course-card">
      <div className={`course-card__cover course-card__cover--${course.accent || "violet"}`}>
        <span className="course-card__pattern" />
        <span className="course-card__icon">
          <Icon size={29} />
        </span>
        <span className="course-card__level">{course.level}</span>
      </div>
      <div className="course-card__body">
        <div className="course-card__meta">
          <span>
            <Clock3 size={14} /> {course.duration}
          </span>
          <span>
            <BookOpen size={14} /> {course.modules} modules
          </span>
        </div>
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="course-card__footer">
          <span>
            <Star size={15} fill="currentColor" /> {course.rating || "4.9"}
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button className="button button--small button--outline" onClick={() => onOpenCourse(course)} type="button">
              View Syllabus
            </button>
            <button className="button button--small" onClick={() => onWhatsAppEnrol(course)} type="button">
              Enrol Now <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Courses({ courses, onOpenCourse, onWhatsAppEnrol }) {
  return (
    <section className="section courses" id="courses">
      <div className="container">
        <SectionHeading
          eyebrow="Popular programs"
          title={
            <>
              Choose a skill. <em>Start building.</em>
            </>
          }
          description="Click Enrol Now to request course access directly from Prashant on WhatsApp!"
        />
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard
              key={course.id || course.title}
              course={course}
              onOpenCourse={onOpenCourse}
              onWhatsAppEnrol={onWhatsAppEnrol}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function LearningPaths() {
  return (
    <section className="section section--soft" id="paths">
      <div className="container">
        <SectionHeading
          eyebrow="Beyond video lessons"
          title={
            <>
              Everything you need to <em>move forward.</em>
            </>
          }
          description="A complete support system from your first roadmap to your first interview."
        />
        <div className="path-grid">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article className={service.className} key={service.title}>
                <span className="path-card__icon">
                  <Icon size={22} />
                </span>
                {service.eyebrow && (
                  <span className="path-card__eyebrow">{service.eyebrow}</span>
                )}
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                {service.bullets && (
                  <ul>
                    {service.bullets.map((bullet) => (
                      <li key={bullet}>
                        <Check size={14} /> {bullet}
                      </li>
                    ))}
                  </ul>
                )}
                <a href="#contact">
                  {service.action} <ArrowRight size={15} />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RoadmapBanner() {
  return (
    <section className="section banner-section">
      <div className="container">
        <div className="roadmap-banner">
          <div className="roadmap-banner__glow" />
          <div className="roadmap-banner__content">
            <span className="roadmap-banner__eyebrow">
              <ShieldCheck size={15} /> Guided from day one
            </span>
            <h2>
              One roadmap. Real projects.
              <br />
              <em>A career you can prove.</em>
            </h2>
            <p>
              Stop collecting random tutorials. Follow a focused plan and
              create work worth showing.
            </p>
            <a className="button button--light" href="#contact">
              Get my learning plan <ArrowRight size={17} />
            </a>
          </div>
          <div className="roadmap-steps">
            <div className="roadmap-step">
              <span>01</span>
              <div>
                <strong>Discover</strong>
                <small>Choose your career goal</small>
              </div>
              <Check size={17} />
            </div>
            <div className="roadmap-step">
              <span>02</span>
              <div>
                <strong>Learn</strong>
                <small>Master the core skills</small>
              </div>
              <Check size={17} />
            </div>
            <div className="roadmap-step roadmap-step--active">
              <span>03</span>
              <div>
                <strong>Build</strong>
                <small>Create portfolio projects</small>
              </div>
              <Rocket size={17} />
            </div>
            <div className="roadmap-step">
              <span>04</span>
              <div>
                <strong>Launch</strong>
                <small>Prepare for opportunities</small>
              </div>
              <ArrowRight size={17} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="section testimonial-section">
      <div className="container testimonial-grid">
        <div className="testimonial-visual">
          <div className="testimonial-visual__ring" />
          <div className="testimonial-portrait">
            <span>AK</span>
          </div>
          <div className="testimonial-achievement">
            <Trophy size={18} />
            <div>
              <strong>Career switch</strong>
              <small>Completed in 5 months</small>
            </div>
          </div>
          <div className="testimonial-skill">
            <Zap size={16} />
            React • Node • Cloud
          </div>
        </div>
        <div className="testimonial-copy">
          <Quote size={38} />
          <blockquote>
            “Skill.Nova gave me the structure I was missing. Instead of jumping
            between tutorials, I followed one roadmap, built three strong
            projects and finally felt confident in interviews.”
          </blockquote>
          <div>
            <strong>Ananya Kapoor</strong>
            <span>Software Developer</span>
          </div>
          <div className="testimonial-dots">
            <button className="is-active" aria-label="Testimonial 1" />
            <button aria-label="Testimonial 2" />
            <button aria-label="Testimonial 3" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Counselling() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    track: "Full-Stack",
    level: "Know the basics",
    fullName: "",
    phone: "",
    email: "",
    query: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await submitLead(formData);
      setSubmitted(true);
    } catch (err) {
      alert("Failed to submit query: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section counselling-section" id="contact">
      <div className="container counselling-grid">
        <div className="counselling-copy">
          <span className="section-heading__eyebrow">Free counselling & queries</span>
          <h2>
            Ask your question,
            <br />
            <em>we’ll map your path.</em>
          </h2>
          <p>
            Have a question about a course or career roadmap? Type your query below and Prashant will review it directly in the Admin Portal database.
          </p>
          <div className="counselling-benefits">
            <span>
              <Check size={15} /> Saved in Database
            </span>
            <span>
              <Clock3 size={15} /> Reply within 24 hours
            </span>
          </div>
          <div className="mentor-note">
            <div className="mentor-note__avatar">NG</div>
            <div>
              <strong>Talk to Prashant & team</strong>
              <small>Get clarity on your queries.</small>
            </div>
          </div>
        </div>
        <form className="counselling-form" onSubmit={handleSubmit}>
          {submitted ? (
            <div className="form-success">
              <span>
                <Check size={27} />
              </span>
              <h3>Query & Application Saved!</h3>
              <p>
                Thanks for reaching out! Your query has been recorded in our backend database and is now visible in Prashant's Admin Dashboard.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    track: "Full-Stack",
                    level: "Know the basics",
                    fullName: "",
                    phone: "",
                    email: "",
                    query: "",
                  });
                }}
              >
                Submit another query
              </button>
            </div>
          ) : (
            <>
              <div className="form-heading">
                <span>Desired learning track</span>
                <div className="choice-row">
                  {["Full-Stack", "Data & AI", "Career help"].map((track) => (
                    <label key={track}>
                      <input
                        checked={formData.track === track}
                        name="track"
                        type="radio"
                        onChange={() => setFormData({ ...formData, track })}
                      />
                      <span>{track}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="field">
                <span>Your current level</span>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                >
                  <option>Complete beginner</option>
                  <option>Know the basics</option>
                  <option>Building projects</option>
                  <option>Preparing for jobs</option>
                </select>
              </label>
              <div className="field-row">
                <label className="field">
                  <span>Full name</span>
                  <input
                    required
                    placeholder="Your full name"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Phone number</span>
                  <input
                    required
                    placeholder="7627043971"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </label>
              </div>
              <label className="field">
                <span>Email address</span>
                <input
                  required
                  placeholder="you@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Your Message / Query</span>
                <textarea
                  rows="3"
                  placeholder="Ask anything about course syllabus, batch timing, fees, career assistance..."
                  value={formData.query}
                  onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                  required
                />
              </label>

              <div className="form-submit">
                <div>
                  <small>Direct to Prashant's Portal</small>
                  <strong>Send your query</strong>
                </div>
                <button className="button" type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Submit Query"} <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

function FAQ({ faqs }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section faq-section" id="resources">
      <div className="container">
        <SectionHeading
          eyebrow="Quick answers"
          title={
            <>
              Frequently asked <em>questions.</em>
            </>
          }
          description="Everything you may want to know before starting your first course."
        />
        <div className="faq-list">
          {faqs.map((faq, index) => {
            const open = index === openIndex;
            return (
              <article className={open ? "faq-item is-open" : "faq-item"} key={faq.id || faq.question}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? -1 : index)}
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={18} />
                </button>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Footer({ contacts }) {
  return (
    <footer className="site-footer">
      <div className="footer-cta">
        <div className="container footer-cta__inner">
          <div>
            <span>Ready for your next chapter?</span>
            <h2>
              Discover your <em>learning path.</em>
            </h2>
          </div>
          <a className="button" href="#contact">
            Get started free <ArrowRight size={17} />
          </a>
        </div>
      </div>
      <div className="container footer-grid">
        <div className="footer-about">
          <Logo compact />
          <p>
            Practical, mentor-guided learning for students who want to turn
            ambition into skills and skills into opportunities.
          </p>
          <span className="footer-badge">
            <ShieldCheck size={16} /> Learn with confidence
          </span>
        </div>
        <div className="footer-column">
          <strong>Programs</strong>
          <a href="#courses">Full-Stack Development</a>
          <a href="#courses">Data Science & ML</a>
          <a href="#courses">Generative AI</a>
          <a href="#courses">Career Preparation</a>
        </div>
        <div className="footer-column">
          <strong>Contact Prashant</strong>
          <a href={contacts.whatsapp || "https://wa.me/917627043971"} target="_blank" rel="noopener noreferrer">
            WhatsApp: {contacts.phone || "7627043971"}
          </a>
          <a href={contacts.instagram || "https://www.instagram.com/prashant_singh_08__/"} target="_blank" rel="noopener noreferrer">
            Instagram: @prashant_singh_08__
          </a>
          <a href={`mailto:${contacts.email || "prashantking0880@gmail.com"}`}>
            Email: {contacts.email || "prashantking0880@gmail.com"}
          </a>
        </div>
        <div className="footer-column">
          <strong>Stay curious</strong>
          <p>Get practical learning tips and launch updates.</p>
          <form className="newsletter" onSubmit={(event) => event.preventDefault()}>
            <input aria-label="Email address" placeholder="Your email" type="email" />
            <button aria-label="Subscribe" type="submit">
              <ArrowRight size={17} />
            </button>
          </form>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Skill.Nova. All rights reserved.</span>
        <div>
          <a href="#top">Privacy</a>
          <a href="#top">Terms</a>
          <a href="#top">Cookies</a>
        </div>
      </div>
    </footer>
  );
}

function ContactRail({ contacts }) {
  const openUrl = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="contact-rail">
      <button
        className="contact-rail__instagram"
        aria-label="Instagram"
        type="button"
        onClick={() => openUrl(contacts.instagram)}
        title="Open Instagram"
      >
        <Instagram size={18} />
      </button>
      <button
        className="contact-rail__whatsapp"
        aria-label="WhatsApp"
        type="button"
        onClick={() => openUrl(contacts.whatsapp)}
        title={`Connect on WhatsApp (${contacts.phone})`}
      >
        <Phone size={18} />
      </button>
      <small>Connect</small>
    </div>
  );
}

function Chatbot({ courses, faqs, contacts }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: `Hi! I’m Nova Guide 👋 Connect with Prashant (+91 ${contacts.phone || "7627043971"}) or ask me any question about our courses!`,
    },
  ]);

  const getReply = (text) => {
    const normalized = text.toLowerCase();
    if (/course|learn|path|full|data|ai|web/.test(normalized)) {
      const titles = courses.map((c) => c.title).join(", ");
      return `Our active programs are: ${titles}. Which track fits your career goals best?`;
    }
    if (/contact|phone|whatsapp|instagram|prashant/.test(normalized)) {
      return `You can connect directly with Prashant on WhatsApp (${contacts.phone}) or via Instagram: ${contacts.instagram}`;
    }
    if (/price|fee|cost|pay/.test(normalized)) {
      return `Pricing and early bird launch offers are available. Book a free counselling call above or message us on WhatsApp!`;
    }
    if (/certificate|certification/.test(normalized)) {
      return `Yes — you earn a Skill.Nova verified certificate upon completing required projects.`;
    }
    return `I can help with courses, mentors, certificates, or booking a call with Prashant. What would you like to know?`;
  };

  const sendMessage = (text) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((current) => [
      ...current,
      { role: "user", text: clean },
      { role: "bot", text: getReply(clean) },
    ]);
    setMessage("");
  };

  const quickReplies = useMemo(
    () => [
      "Show available courses",
      `Chat on WhatsApp (${contacts.phone || "7627043971"})`,
      "Do you offer certificates?",
    ],
    [contacts.phone],
  );

  return (
    <>
      <ContactRail contacts={contacts} />
      <div className={open ? "chatbot is-open" : "chatbot"}>
        {open && (
          <div className="chatbot-panel">
            <div className="chatbot-header">
              <span className="chatbot-header__icon">
                <Bot size={19} />
              </span>
              <div>
                <strong>Nova Guide</strong>
                <small>
                  <span /> Online now
                </small>
              </div>
              <button type="button" aria-label="Close chat" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="chatbot-body">
              {messages.map((item, index) => (
                <div className={`chat-message chat-message--${item.role}`} key={`${item.text}-${index}`}>
                  {item.role === "bot" && (
                    <span className="chat-message__avatar">
                      <Sparkles size={13} />
                    </span>
                  )}
                  <p>{item.text}</p>
                </div>
              ))}
              {messages.length === 1 && (
                <div className="quick-replies">
                  {quickReplies.map((reply) => (
                    <button key={reply} type="button" onClick={() => sendMessage(reply)}>
                      {reply} <ChevronRight size={13} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <form
              className="chatbot-input"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(message);
              }}
            >
              <input
                aria-label="Chat message"
                placeholder="Type your question..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
              <button type="submit" aria-label="Send message">
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
        <button
          className="chatbot-trigger"
          type="button"
          aria-label={open ? "Close Nova Guide" : "Open Nova Guide"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={21} /> : <MessageCircleMore size={23} />}
          {!open && <span />}
        </button>
      </div>
    </>
  );
}

function App() {
  const [viewMode, setViewMode] = useState("learner"); // 'learner' | 'admin'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedCourseForViewer, setSelectedCourseForViewer] = useState(null);

  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [courses, setCourses] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [contacts, setContacts] = useState({});

  const loadBackendData = async () => {
    try {
      const [c, f, cont] = await Promise.all([
        getCourses().catch(() => []),
        getFAQs().catch(() => []),
        getContacts().catch(() => ({})),
      ]);
      setCourses(c);
      setFaqs(f);
      setContacts(cont);
    } catch (err) {
      console.error("Error loading data from API:", err);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  const handleAdminSuccess = () => {
    setShowAuthModal(false);
    setViewMode("admin");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUserSuccess = (user) => {
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleUserLogout = () => {
    logoutUser();
    logoutAdmin();
    setCurrentUser(null);
  };

  const handleWhatsAppEnrol = (course) => {
    const message = `Hi Prashant! I want to enrol in the course: "${course.title}". Please grant me course access.`;
    const waUrl = `https://wa.me/917627043971?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    // Also open course syllabus/video modal
    setSelectedCourseForViewer(course);
  };

  if (viewMode === "admin") {
    return (
      <AdminDashboard
        onReturnToUser={() => {
          setViewMode("learner");
          loadBackendData();
        }}
      />
    );
  }

  return (
    <>
      <Header
        currentMode={viewMode}
        onOpenAuthModal={() => setShowAuthModal(true)}
        currentUser={currentUser}
        onUserLogout={handleUserLogout}
        onOpenAdminConsole={() => setViewMode("admin")}
      />
      <main>
        <Hero />
        <Courses
          courses={courses}
          onOpenCourse={(c) => setSelectedCourseForViewer(c)}
          onWhatsAppEnrol={handleWhatsAppEnrol}
        />
        <LearningPaths />
        <RoadmapBanner />
        <Testimonial />
        <Counselling />
        <FAQ faqs={faqs} />
      </main>
      <Footer contacts={contacts} />
      <Chatbot contacts={contacts} courses={courses} faqs={faqs} />

      <UserAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onUserSuccess={handleUserSuccess}
        onAdminSuccess={handleAdminSuccess}
      />

      <CourseViewerModal
        course={selectedCourseForViewer}
        isOpen={!!selectedCourseForViewer}
        onClose={() => setSelectedCourseForViewer(null)}
      />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
