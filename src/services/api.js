const API_BASE_URL = "/api";

export const TOKEN_KEYS = {
  USER_TOKEN: "skillnova_user_token",
  USER_DATA: "skillnova_user_data",
  ADMIN_TOKEN: "skillnova_admin_token",
  ADMIN_DATA: "skillnova_admin_data",
};

// Helper for HTTP requests
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = options.headers || {};

  // Attach Content-Type if not sending FormData
  if (!options.isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Attach Authorization headers if tokens exist
  if (options.useAdminAuth) {
    const token = localStorage.getItem(TOKEN_KEYS.ADMIN_TOKEN);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } else if (options.useUserAuth) {
    const token = localStorage.getItem(TOKEN_KEYS.USER_TOKEN);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || `Server error (${res.status})` };
    }

    if (!res.ok) {
      // Handle expired token or unauthorized response
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
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

/* ================= USER AUTH API ================= */

export async function loginUser(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data.token) {
    localStorage.setItem(TOKEN_KEYS.USER_TOKEN, data.token);
    localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(data.user));
  }
  return data;
}

export async function signupUser(name, email, password) {
  const data = await request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  if (data.token) {
    localStorage.setItem(TOKEN_KEYS.USER_TOKEN, data.token);
    localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(data.user));
  }
  return data;
}

export async function getCurrentUser() {
  const token = localStorage.getItem(TOKEN_KEYS.USER_TOKEN);
  if (!token) return null;
  try {
    const data = await request("/auth/me", { useUserAuth: true });
    return data.user;
  } catch {
    return null;
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
  const data = await request("/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data.token) {
    localStorage.setItem(TOKEN_KEYS.ADMIN_TOKEN, data.token);
    localStorage.setItem(TOKEN_KEYS.ADMIN_DATA, JSON.stringify(data.admin));
  }
  return data;
}

export async function getCurrentAdmin() {
  const token = localStorage.getItem(TOKEN_KEYS.ADMIN_TOKEN);
  if (!token) return null;
  try {
    const data = await request("/admin/me", { useAdminAuth: true });
    return data.admin;
  } catch {
    return null;
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
    if (adminData.success) {
      return { type: "admin", data: adminData.admin, token: adminData.token };
    }
  } catch (err) {
    // If admin attempt fails with non-network error, fallback to user login
  }

  // Try Normal User Login
  const userData = await loginUser(cleanEmail, password);
  return { type: "user", data: userData.user, token: userData.token };
}

export async function updateAdminCredentials(gmail, newPassword) {
  return await request("/admin/credentials", {
    method: "PUT",
    useAdminAuth: true,
    body: JSON.stringify({ gmail, newPassword }),
  });
}

/* ================= COURSES & VIDEOS API ================= */

export async function getCourses() {
  const data = await request("/courses");
  return data.courses || [];
}

export async function getCourseDetails(courseId) {
  const data = await request(`/courses/${courseId}`);
  return data.course;
}

export async function addCourse(courseData) {
  const data = await request("/courses", {
    method: "POST",
    useAdminAuth: true,
    body: JSON.stringify(courseData),
  });
  return data.course;
}

export async function updateCourse(courseId, courseData) {
  const data = await request(`/courses/${courseId}`, {
    method: "PUT",
    useAdminAuth: true,
    body: JSON.stringify(courseData),
  });
  return data.course;
}

export async function deleteCourse(courseId) {
  return await request(`/courses/${courseId}`, {
    method: "DELETE",
    useAdminAuth: true,
  });
}

/* ================= VIDEO MANAGEMENT API ================= */

export async function getCourseVideos(courseId) {
  const data = await request(`/videos/course/${courseId}`);
  return data.videos || [];
}

export async function uploadCourseVideo(courseId, videoDataOrFormData) {
  const isFormData = videoDataOrFormData instanceof FormData;
  const options = {
    method: "POST",
    useAdminAuth: true,
    isFormData,
    body: isFormData ? videoDataOrFormData : JSON.stringify(videoDataOrFormData),
  };
  const data = await request(`/videos/course/${courseId}`, options);
  return data.video;
}

export async function updateCourseVideo(videoId, videoData) {
  const data = await request(`/videos/${videoId}`, {
    method: "PUT",
    useAdminAuth: true,
    body: JSON.stringify(videoData),
  });
  return data.video;
}

export async function deleteCourseVideo(videoId) {
  return await request(`/videos/${videoId}`, {
    method: "DELETE",
    useAdminAuth: true,
  });
}

/* ================= LEADS & COUNSELLING API ================= */

export async function submitLead(leadData) {
  const data = await request("/leads", {
    method: "POST",
    body: JSON.stringify(leadData),
  });
  return data.lead;
}

export async function getLeads() {
  const data = await request("/leads", { useAdminAuth: true });
  return data.leads || [];
}

export async function updateLeadStatus(leadId, status) {
  const data = await request(`/leads/${leadId}/status`, {
    method: "PUT",
    useAdminAuth: true,
    body: JSON.stringify({ status }),
  });
  return data.lead;
}

export async function deleteLead(leadId) {
  return await request(`/leads/${leadId}`, {
    method: "DELETE",
    useAdminAuth: true,
  });
}

/* ================= FAQS & CONTACTS API ================= */

export async function getFAQs() {
  const data = await request("/faqs");
  return data.faqs || [];
}

export async function addFAQ(faqData) {
  const data = await request("/faqs", {
    method: "POST",
    useAdminAuth: true,
    body: JSON.stringify(faqData),
  });
  return data.faq;
}

export async function deleteFAQ(faqId) {
  return await request(`/faqs/${faqId}`, {
    method: "DELETE",
    useAdminAuth: true,
  });
}

export async function getContacts() {
  const data = await request("/contacts");
  return data.contacts || {};
}

export async function saveContacts(contactData) {
  const data = await request("/contacts", {
    method: "PUT",
    useAdminAuth: true,
    body: JSON.stringify(contactData),
  });
  return data.contacts;
}
