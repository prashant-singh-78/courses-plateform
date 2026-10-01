import bcrypt from "bcryptjs";

const API_BASE_URL = "/api";

export const TOKEN_KEYS = {
  USER_TOKEN: "skillnova_user_token",
  USER_DATA: "skillnova_user_data",
  ADMIN_TOKEN: "skillnova_admin_token",
  ADMIN_DATA: "skillnova_admin_data",
  LOCAL_COURSES: "skillnova_courses",
  LOCAL_FAQS: "skillnova_faqs",
  LOCAL_LEADS: "skillnova_leads",
  LOCAL_CONTACTS: "skillnova_contacts",
  LOCAL_VIDEOS: "skillnova_videos",
  LOCAL_USERS: "skillnova_users",
  LOCAL_ADMIN: "skillnova_admin_auth",
};

// Default fallback data for static GitHub Pages deployment
const DEFAULT_CONTACTS = {
  email: "prashantking0880@gmail.com",
  admin_gmail: "prashantking0880@gmail.com",
  instagram: "https://www.instagram.com/prashant_singh_08__/",
  whatsapp: "https://wa.me/917627043971",
  phone: "7627043971",
};

const DEFAULT_ADMIN = {
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
    description: "Build production-ready apps with React, Node.js, databases and cloud deployment.",
    modules: 42,
    rating: "4.9",
  },
  {
    id: "c2",
    accent: "mint",
    level: "Career track",
    duration: "12 weeks",
    title: "Data Science & Machine Learning",
    description: "Learn Python, analytics, ML workflows and practical model deployment.",
    modules: 36,
    rating: "4.8",
  },
  {
    id: "c3",
    accent: "orange",
    level: "Most popular",
    duration: "10 weeks",
    title: "Generative AI Engineering",
    description: "Create AI products with LLMs, RAG, agents, evaluation and responsible AI.",
    modules: 31,
    rating: "4.9",
  },
];

const DEFAULT_VIDEOS = {
  c1: [
    {
      id: "v1_1",
      course_id: "c1",
      title: "1. Introduction to Web Development & HTML5",
      description: "Learn HTML structure, modern semantic tags, accessibility, and clean page markup.",
      video_url: "https://www.youtube.com/embed/mU6anWqZJcc",
      sequence: 1,
      status: "Active",
    },
    {
      id: "v1_2",
      course_id: "c1",
      title: "2. CSS Fundamentals, Flexbox & Grid",
      description: "Master modern CSS layout systems, responsive web design principles, and custom styling.",
      video_url: "https://www.youtube.com/embed/1Rs2ND1ryYc",
      sequence: 2,
      status: "Active",
    },
    {
      id: "v1_3",
      course_id: "c1",
      title: "3. JavaScript Modern ES6+ & Async/Await",
      description: "Understand JS engine, DOM manipulation, promises, async data fetching, and state.",
      video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
      sequence: 3,
      status: "Active",
    },
  ],
};

const DEFAULT_FAQS = [
  {
    id: "f1",
    question: "Who can learn on Skill.Nova?",
    answer: "Skill.Nova is designed for college students, fresh graduates and working professionals. Every track clearly shows the prerequisites, so you can start at the right level.",
  },
  {
    id: "f2",
    question: "Are the courses live or recorded?",
    answer: "Tracks combine structured recorded lessons, live mentor sessions, assignments and practical projects. You can learn flexibly while still getting human guidance.",
  },
  {
    id: "f3",
    question: "Will I get projects for my portfolio?",
    answer: "Yes. Each career track includes guided projects and a final capstone. You will also get tips for presenting the work on GitHub, your resume and LinkedIn.",
  },
  {
    id: "f4",
    question: "Does Skill.Nova provide placement support?",
    answer: "Career tracks include resume reviews, mock interviews, job-search strategy and opportunity updates. We support your preparation, while hiring decisions remain with employers.",
  },
  {
    id: "f5",
    question: "Can I speak with someone before enrolling?",
    answer: "Absolutely. Use the free counselling form or open the Nova Guide chatbot. We will help you choose a track without pressure.",
  },
];

// Helper functions for localStorage fallback
function getLocalItem(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalItem(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
}

// Helper for HTTP requests with backend API
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = options.headers || {};

  if (!options.isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (options.useAdminAuth) {
    const token = localStorage.getItem(TOKEN_KEYS.ADMIN_TOKEN);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } else if (options.useUserAuth) {
    const token = localStorage.getItem(TOKEN_KEYS.USER_TOKEN);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const config = { ...options, headers };

  const res = await fetch(url, config);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || `Server error (${res.status})` };
  }

  if (!res.ok) {
    if (res.status === 401 && options.useAdminAuth) {
      localStorage.removeItem(TOKEN_KEYS.ADMIN_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.ADMIN_DATA);
    }
    if (res.status === 401 && options.useUserAuth) {
      localStorage.removeItem(TOKEN_KEYS.USER_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.USER_DATA);
    }
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

/* ================= USER AUTH API ================= */

export async function loginUser(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: cleanEmail, password }),
    });
    if (data.token) {
      localStorage.setItem(TOKEN_KEYS.USER_TOKEN, data.token);
      localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(data.user));
    }
    return data;
  } catch (err) {
    // Local Fallback for static GitHub Pages
    const users = getLocalItem(TOKEN_KEYS.LOCAL_USERS, []);
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (found && bcrypt.compareSync(password, found.passwordHash)) {
      const userData = { id: found.id, name: found.name, email: found.email, role: "user" };
      const fakeToken = `user_token_fallback_${Date.now()}`;
      localStorage.setItem(TOKEN_KEYS.USER_TOKEN, fakeToken);
      localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
      return { success: true, token: fakeToken, user: userData };
    }
    throw new Error("Invalid Email or Password.");
  }
}

export async function signupUser(name, email, password) {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const data = await request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email: cleanEmail, password }),
    });
    if (data.token) {
      localStorage.setItem(TOKEN_KEYS.USER_TOKEN, data.token);
      localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(data.user));
    }
    return data;
  } catch (err) {
    // Local Fallback for static GitHub Pages
    const users = getLocalItem(TOKEN_KEYS.LOCAL_USERS, []);
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error("User already exists with this Email.");
    }
    const newUser = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      passwordHash: bcrypt.hashSync(password, 10),
    };
    setLocalItem(TOKEN_KEYS.LOCAL_USERS, [...users, newUser]);
    const userData = { id: newUser.id, name: newUser.name, email: newUser.email, role: "user" };
    const fakeToken = `user_token_fallback_${Date.now()}`;
    localStorage.setItem(TOKEN_KEYS.USER_TOKEN, fakeToken);
    localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
    return { success: true, token: fakeToken, user: userData };
  }
}

export async function getCurrentUser() {
  const token = localStorage.getItem(TOKEN_KEYS.USER_TOKEN);
  if (!token) return null;
  try {
    const data = await request("/auth/me", { useUserAuth: true });
    return data.user;
  } catch {
    return getStoredUser();
  }
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEYS.USER_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.USER_DATA);
}

export function getStoredUser() {
  try {
    const userStr = localStorage.getItem(TOKEN_KEYS.USER_DATA);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

/* ================= ADMIN AUTH API ================= */

export async function loginAdmin(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const data = await request("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email: cleanEmail, password }),
    });
    if (data.token) {
      localStorage.setItem(TOKEN_KEYS.ADMIN_TOKEN, data.token);
      localStorage.setItem(TOKEN_KEYS.ADMIN_DATA, JSON.stringify(data.admin));
    }
    return data;
  } catch (err) {
    // Local Fallback for static GitHub Pages
    const admin = getLocalItem(TOKEN_KEYS.LOCAL_ADMIN, DEFAULT_ADMIN);
    if (cleanEmail === admin.gmail.toLowerCase() && bcrypt.compareSync(password, admin.passwordHash)) {
      const adminData = { gmail: admin.gmail, role: "admin" };
      const fakeToken = `admin_token_fallback_${Date.now()}`;
      localStorage.setItem(TOKEN_KEYS.ADMIN_TOKEN, fakeToken);
      localStorage.setItem(TOKEN_KEYS.ADMIN_DATA, JSON.stringify(adminData));
      return { success: true, token: fakeToken, admin: adminData };
    }
    throw new Error("Invalid Admin Gmail ID or Password.");
  }
}

export async function getCurrentAdmin() {
  const token = localStorage.getItem(TOKEN_KEYS.ADMIN_TOKEN);
  if (!token) return null;
  try {
    const data = await request("/admin/me", { useAdminAuth: true });
    return data.admin;
  } catch {
    const adminData = localStorage.getItem(TOKEN_KEYS.ADMIN_DATA);
    return adminData ? JSON.parse(adminData) : null;
  }
}

export function isAdminLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEYS.ADMIN_TOKEN);
}

export function logoutAdmin() {
  localStorage.removeItem(TOKEN_KEYS.ADMIN_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.ADMIN_DATA);
}

export async function unifiedLogin(email, password) {
  const cleanEmail = email.trim().toLowerCase();

  // Try Admin Login first
  try {
    const adminData = await loginAdmin(cleanEmail, password);
    if (adminData && adminData.success) {
      return { type: "admin", data: adminData.admin, token: adminData.token };
    }
  } catch (err) {
    // Fallback to user login if admin login fails
  }

  // Try Normal User Login
  const userData = await loginUser(cleanEmail, password);
  return { type: "user", data: userData.user, token: userData.token };
}

export async function updateAdminCredentials(gmail, newPassword) {
  const cleanGmail = gmail.trim().toLowerCase();
  try {
    return await request("/admin/credentials", {
      method: "PUT",
      useAdminAuth: true,
      body: JSON.stringify({ gmail: cleanGmail, newPassword }),
    });
  } catch (err) {
    // Local Fallback for static GitHub Pages
    const currentAdmin = getLocalItem(TOKEN_KEYS.LOCAL_ADMIN, DEFAULT_ADMIN);
    const updated = {
      gmail: cleanGmail,
      passwordHash: newPassword ? bcrypt.hashSync(newPassword, 10) : currentAdmin.passwordHash,
    };
    setLocalItem(TOKEN_KEYS.LOCAL_ADMIN, updated);
    return { success: true, message: "Admin credentials updated locally!" };
  }
}

/* ================= COURSES & VIDEOS API ================= */

export async function getCourses() {
  try {
    const data = await request("/courses");
    if (data.courses && data.courses.length > 0) {
      setLocalItem(TOKEN_KEYS.LOCAL_COURSES, data.courses);
      return data.courses;
    }
    return getLocalItem(TOKEN_KEYS.LOCAL_COURSES, DEFAULT_COURSES);
  } catch (err) {
    // Always return local fallback courses on error / static host
    return getLocalItem(TOKEN_KEYS.LOCAL_COURSES, DEFAULT_COURSES);
  }
}

export async function getCourseDetails(courseId) {
  try {
    const data = await request(`/courses/${courseId}`);
    return data.course;
  } catch (err) {
    const courses = getLocalItem(TOKEN_KEYS.LOCAL_COURSES, DEFAULT_COURSES);
    const course = courses.find((c) => c.id === courseId);
    if (!course) return null;
    const allVideos = getLocalItem(TOKEN_KEYS.LOCAL_VIDEOS, DEFAULT_VIDEOS);
    const vids = allVideos[courseId] || [];
    return { ...course, videos: vids };
  }
}

export async function addCourse(courseData) {
  try {
    const data = await request("/courses", {
      method: "POST",
      useAdminAuth: true,
      body: JSON.stringify(courseData),
    });
    return data.course;
  } catch (err) {
    // Local Fallback for static GitHub Pages
    const courses = getLocalItem(TOKEN_KEYS.LOCAL_COURSES, DEFAULT_COURSES);
    const newCourse = { ...courseData, id: `c_${Date.now()}` };
    setLocalItem(TOKEN_KEYS.LOCAL_COURSES, [newCourse, ...courses]);
    return newCourse;
  }
}

export async function updateCourse(courseId, courseData) {
  try {
    const data = await request(`/courses/${courseId}`, {
      method: "PUT",
      useAdminAuth: true,
      body: JSON.stringify(courseData),
    });
    return data.course;
  } catch (err) {
    const courses = getLocalItem(TOKEN_KEYS.LOCAL_COURSES, DEFAULT_COURSES);
    const updated = courses.map((c) => (c.id === courseId ? { ...c, ...courseData } : c));
    setLocalItem(TOKEN_KEYS.LOCAL_COURSES, updated);
    return { ...courseData, id: courseId };
  }
}

export async function deleteCourse(courseId) {
  try {
    return await request(`/courses/${courseId}`, {
      method: "DELETE",
      useAdminAuth: true,
    });
  } catch (err) {
    const courses = getLocalItem(TOKEN_KEYS.LOCAL_COURSES, DEFAULT_COURSES);
    setLocalItem(
      TOKEN_KEYS.LOCAL_COURSES,
      courses.filter((c) => c.id !== courseId)
    );
    return { success: true };
  }
}

/* ================= VIDEO MANAGEMENT API ================= */

export async function getCourseVideos(courseId) {
  try {
    const data = await request(`/videos/course/${courseId}`);
    return data.videos || [];
  } catch (err) {
    const allVideos = getLocalItem(TOKEN_KEYS.LOCAL_VIDEOS, DEFAULT_VIDEOS);
    return allVideos[courseId] || [];
  }
}

export async function uploadCourseVideo(courseId, videoDataOrFormData) {
  const isFormData = videoDataOrFormData instanceof FormData;
  try {
    const options = {
      method: "POST",
      useAdminAuth: true,
      isFormData,
      body: isFormData ? videoDataOrFormData : JSON.stringify(videoDataOrFormData),
    };
    const data = await request(`/videos/course/${courseId}`, options);
    return data.video;
  } catch (err) {
    // Local Fallback for static GitHub Pages
    const allVideos = getLocalItem(TOKEN_KEYS.LOCAL_VIDEOS, DEFAULT_VIDEOS);
    const courseVids = allVideos[courseId] || [];

    let title = "Uploaded Video";
    let description = "";
    let videoUrl = "";
    let sequence = courseVids.length + 1;
    let status = "Active";

    if (isFormData) {
      title = videoDataOrFormData.get("title") || title;
      description = videoDataOrFormData.get("description") || description;
      sequence = parseInt(videoDataOrFormData.get("sequence")) || sequence;
      status = videoDataOrFormData.get("status") || status;
      videoUrl = "https://www.youtube.com/embed/mU6anWqZJcc";
    } else {
      title = videoDataOrFormData.title || title;
      description = videoDataOrFormData.description || description;
      videoUrl = videoDataOrFormData.videoUrl || videoUrl;
      sequence = videoDataOrFormData.sequence || sequence;
      status = videoDataOrFormData.status || status;
    }

    const newVid = {
      id: `v_${Date.now()}`,
      course_id: courseId,
      title,
      description,
      video_url: videoUrl,
      sequence,
      status,
    };

    allVideos[courseId] = [...courseVids, newVid];
    setLocalItem(TOKEN_KEYS.LOCAL_VIDEOS, allVideos);
    return newVid;
  }
}

export async function updateCourseVideo(videoId, videoData) {
  try {
    const data = await request(`/videos/${videoId}`, {
      method: "PUT",
      useAdminAuth: true,
      body: JSON.stringify(videoData),
    });
    return data.video;
  } catch (err) {
    return { ...videoData, id: videoId };
  }
}

export async function deleteCourseVideo(videoId) {
  try {
    return await request(`/videos/${videoId}`, {
      method: "DELETE",
      useAdminAuth: true,
    });
  } catch (err) {
    const allVideos = getLocalItem(TOKEN_KEYS.LOCAL_VIDEOS, DEFAULT_VIDEOS);
    for (const cId in allVideos) {
      allVideos[cId] = allVideos[cId].filter((v) => v.id !== videoId);
    }
    setLocalItem(TOKEN_KEYS.LOCAL_VIDEOS, allVideos);
    return { success: true };
  }
}

/* ================= LEADS & COUNSELLING API ================= */

export async function submitLead(leadData) {
  try {
    const data = await request("/leads", {
      method: "POST",
      body: JSON.stringify(leadData),
    });
    return data.lead;
  } catch (err) {
    // Local Fallback for static GitHub Pages
    const leads = getLocalItem(TOKEN_KEYS.LOCAL_LEADS, []);
    const newLead = {
      ...leadData,
      id: `l_${Date.now()}`,
      status: "Pending",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setLocalItem(TOKEN_KEYS.LOCAL_LEADS, [newLead, ...leads]);
    return newLead;
  }
}

export async function getLeads() {
  try {
    const data = await request("/leads", { useAdminAuth: true });
    return data.leads || [];
  } catch (err) {
    return getLocalItem(TOKEN_KEYS.LOCAL_LEADS, []);
  }
}

export async function updateLeadStatus(leadId, status) {
  try {
    const data = await request(`/leads/${leadId}/status`, {
      method: "PUT",
      useAdminAuth: true,
      body: JSON.stringify({ status }),
    });
    return data.lead;
  } catch (err) {
    const leads = getLocalItem(TOKEN_KEYS.LOCAL_LEADS, []);
    const updated = leads.map((l) => (l.id === leadId ? { ...l, status } : l));
    setLocalItem(TOKEN_KEYS.LOCAL_LEADS, updated);
    return { id: leadId, status };
  }
}

export async function deleteLead(leadId) {
  try {
    return await request(`/leads/${leadId}`, {
      method: "DELETE",
      useAdminAuth: true,
    });
  } catch (err) {
    const leads = getLocalItem(TOKEN_KEYS.LOCAL_LEADS, []);
    setLocalItem(
      TOKEN_KEYS.LOCAL_LEADS,
      leads.filter((l) => l.id !== leadId)
    );
    return { success: true };
  }
}

/* ================= FAQS & CONTACTS API ================= */

export async function getFAQs() {
  try {
    const data = await request("/faqs");
    return data.faqs || [];
  } catch (err) {
    return getLocalItem(TOKEN_KEYS.LOCAL_FAQS, DEFAULT_FAQS);
  }
}

export async function addFAQ(faqData) {
  try {
    const data = await request("/faqs", {
      method: "POST",
      useAdminAuth: true,
      body: JSON.stringify(faqData),
    });
    return data.faq;
  } catch (err) {
    const faqs = getLocalItem(TOKEN_KEYS.LOCAL_FAQS, DEFAULT_FAQS);
    const newFaq = { ...faqData, id: `f_${Date.now()}` };
    setLocalItem(TOKEN_KEYS.LOCAL_FAQS, [...faqs, newFaq]);
    return newFaq;
  }
}

export async function deleteFAQ(faqId) {
  try {
    return await request(`/faqs/${faqId}`, {
      method: "DELETE",
      useAdminAuth: true,
    });
  } catch (err) {
    const faqs = getLocalItem(TOKEN_KEYS.LOCAL_FAQS, DEFAULT_FAQS);
    setLocalItem(
      TOKEN_KEYS.LOCAL_FAQS,
      faqs.filter((f) => f.id !== faqId)
    );
    return { success: true };
  }
}

export async function getContacts() {
  try {
    const data = await request("/contacts");
    return data.contacts || DEFAULT_CONTACTS;
  } catch (err) {
    return getLocalItem(TOKEN_KEYS.LOCAL_CONTACTS, DEFAULT_CONTACTS);
  }
}

export async function saveContacts(contactData) {
  try {
    const data = await request("/contacts", {
      method: "PUT",
      useAdminAuth: true,
      body: JSON.stringify(contactData),
    });
    return data.contacts;
  } catch (err) {
    setLocalItem(TOKEN_KEYS.LOCAL_CONTACTS, contactData);
    return contactData;
  }
}
