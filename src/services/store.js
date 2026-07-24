// Dynamic local store for Skill.Nova with bcrypt authentication

import bcrypt from "bcryptjs";

const DEFAULT_CONTACTS = {
  email: "prashantking0880@gmail.com",
  adminGmail: "prashantking0880@gmail.com",
  instagram: "https://www.instagram.com/prashant_singh_08__/",
  whatsapp: "https://wa.me/917627043971",
  phone: "7627043971",
};

// Configured Admin Credentials (bcrypt hashed)
const DEFAULT_ADMIN_AUTH = {
  gmail: "prashantking0880@gmail.com",
  passwordHash: bcrypt.hashSync("prash7878@#", 10),
};

const DEFAULT_COURSES = [
  {
    id: "c1",
    accent: "violet",
    level: "Beginner to advanced",
    duration: "14 weeks",
    title: "Full-Stack Web Development",
    description:
      "Build production-ready apps with React, Node.js, databases and cloud deployment.",
    modules: 42,
    rating: "4.9",
  },
  {
    id: "c2",
    accent: "mint",
    level: "Career track",
    duration: "12 weeks",
    title: "Data Science & Machine Learning",
    description:
      "Learn Python, analytics, ML workflows and practical model deployment.",
    modules: 36,
    rating: "4.8",
  },
  {
    id: "c3",
    accent: "orange",
    level: "Most popular",
    duration: "10 weeks",
    title: "Generative AI Engineering",
    description:
      "Create AI products with LLMs, RAG, agents, evaluation and responsible AI.",
    modules: 31,
    rating: "4.9",
  },
];

const DEFAULT_FAQS = [
  {
    id: "f1",
    question: "Who can learn on Skill.Nova?",
    answer:
      "Skill.Nova is designed for college students, fresh graduates and working professionals. Every track clearly shows the prerequisites, so you can start at the right level.",
  },
  {
    id: "f2",
    question: "Are the courses live or recorded?",
    answer:
      "Tracks combine structured recorded lessons, live mentor sessions, assignments and practical projects. You can learn flexibly while still getting human guidance.",
  },
  {
    id: "f3",
    question: "Will I get projects for my portfolio?",
    answer:
      "Yes. Each career track includes guided projects and a final capstone. You will also get tips for presenting the work on GitHub, your resume and LinkedIn.",
  },
  {
    id: "f4",
    question: "Does Skill.Nova provide placement support?",
    answer:
      "Career tracks include resume reviews, mock interviews, job-search strategy and opportunity updates. We support your preparation, while hiring decisions remain with employers.",
  },
  {
    id: "f5",
    question: "Can I speak with someone before enrolling?",
    answer:
      "Absolutely. Use the free counselling form or open the Nova Guide chatbot. We will help you choose a track without pressure.",
  },
];

const DEFAULT_LEADS = [
  {
    id: "l1",
    fullName: "Aarav Sharma",
    phone: "+91 98765 43210",
    email: "aarav@example.com",
    track: "Full-Stack",
    level: "Know the basics",
    query: "I want to know if this course covers cloud deployment on AWS & Docker?",
    status: "Pending",
    createdAt: "2026-07-24",
  },
  {
    id: "l2",
    fullName: "Priya Patel",
    phone: "+91 87654 32109",
    email: "priya@example.com",
    track: "Data & AI",
    level: "Preparing for jobs",
    query: "Can I take weekend live mentor sessions for Machine Learning capstone?",
    status: "Contacted",
    createdAt: "2026-07-23",
  },
];

const STORAGE_KEYS = {
  CONTACTS: "skillnova_contacts",
  ADMIN_AUTH: "skillnova_admin_auth",
  ADMIN_SESSION: "skillnova_admin_session",
  COURSES: "skillnova_courses",
  FAQS: "skillnova_faqs",
  LEADS: "skillnova_leads",
};

const LISTENERS = new Set();

function notifyListeners() {
  LISTENERS.forEach((callback) => callback());
}

export function subscribeStore(callback) {
  LISTENERS.add(callback);
  return () => LISTENERS.delete(callback);
}

function getItem(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyListeners();
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
}

/* ================= AUTHENTICATION SERVICES ================= */

export function getAdminAuth() {
  return getItem(STORAGE_KEYS.ADMIN_AUTH, DEFAULT_ADMIN_AUTH);
}

export function verifyAdminLogin(email, password) {
  const auth = getAdminAuth();
  if (email.trim().toLowerCase() !== auth.gmail.trim().toLowerCase()) {
    return { success: false, error: "Invalid Admin Gmail ID" };
  }
  const isMatch = bcrypt.compareSync(password, auth.passwordHash);
  if (!isMatch) {
    return { success: false, error: "Incorrect Password" };
  }
  
  // Set session
  try {
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify({ email, loggedInAt: Date.now() }));
  } catch (e) {
    console.error(e);
  }
  notifyListeners();
  return { success: true };
}

export function isAdminLoggedIn() {
  try {
    const session = sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    return !!session;
  } catch {
    return false;
  }
}

export function logoutAdmin() {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  } catch (e) {
    console.error(e);
  }
  notifyListeners();
}

export function updateAdminCredentials(newGmail, newPassword) {
  const currentAuth = getAdminAuth();
  const updated = {
    gmail: newGmail.trim().toLowerCase(),
    passwordHash: newPassword ? bcrypt.hashSync(newPassword, 10) : currentAuth.passwordHash,
  };
  setItem(STORAGE_KEYS.ADMIN_AUTH, updated);
  
  // Update contact info admin email too
  const contacts = getContacts();
  saveContacts({ ...contacts, adminGmail: updated.gmail });
}

/* ================= DATA SERVICES ================= */

export function getContacts() {
  return getItem(STORAGE_KEYS.CONTACTS, DEFAULT_CONTACTS);
}

export function saveContacts(contacts) {
  setItem(STORAGE_KEYS.CONTACTS, contacts);
}

export function getCourses() {
  return getItem(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
}

export function saveCourses(courses) {
  setItem(STORAGE_KEYS.COURSES, courses);
}

export function addCourse(course) {
  const current = getCourses();
  const newCourse = {
    ...course,
    id: `c_${Date.now()}`,
  };
  saveCourses([newCourse, ...current]);
  return newCourse;
}

export function deleteCourse(id) {
  const current = getCourses();
  saveCourses(current.filter((c) => c.id !== id));
}

export function updateCourse(id, updatedCourse) {
  const current = getCourses();
  saveCourses(
    current.map((c) => (c.id === id ? { ...c, ...updatedCourse } : c)),
  );
}

export function getFAQs() {
  return getItem(STORAGE_KEYS.FAQS, DEFAULT_FAQS);
}

export function saveFAQs(faqs) {
  setItem(STORAGE_KEYS.FAQS, faqs);
}

export function addFAQ(faq) {
  const current = getFAQs();
  const newFaq = {
    ...faq,
    id: `f_${Date.now()}`,
  };
  saveFAQs([...current, newFaq]);
  return newFaq;
}

export function deleteFAQ(id) {
  const current = getFAQs();
  saveFAQs(current.filter((f) => f.id !== id));
}

export function getLeads() {
  return getItem(STORAGE_KEYS.LEADS, DEFAULT_LEADS);
}

export function saveLeads(leads) {
  setItem(STORAGE_KEYS.LEADS, leads);
}

export function addLead(leadData) {
  const current = getLeads();
  const newLead = {
    ...leadData,
    id: `l_${Date.now()}`,
    status: "Pending",
    createdAt: new Date().toISOString().split("T")[0],
  };
  saveLeads([newLead, ...current]);
  return newLead;
}

export function updateLeadStatus(id, status) {
  const current = getLeads();
  saveLeads(current.map((l) => (l.id === id ? { ...l, status } : l)));
}

export function deleteLead(id) {
  const current = getLeads();
  saveLeads(current.filter((l) => l.id !== id));
}

export function resetStoreToDefaults() {
  setItem(STORAGE_KEYS.CONTACTS, DEFAULT_CONTACTS);
  setItem(STORAGE_KEYS.ADMIN_AUTH, DEFAULT_ADMIN_AUTH);
  setItem(STORAGE_KEYS.COURSES, DEFAULT_COURSES);
  setItem(STORAGE_KEYS.FAQS, DEFAULT_FAQS);
  setItem(STORAGE_KEYS.LEADS, DEFAULT_LEADS);
  sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
}
