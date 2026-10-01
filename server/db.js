import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath);

// Helper function to run sql queries with Promise wrapper
export function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

export function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

export async function initDatabase() {
  // Enable foreign keys
  await runQuery("PRAGMA foreign_keys = ON;");

  // Create Users Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Admin Credentials Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gmail TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Courses Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      level TEXT NOT NULL,
      duration TEXT NOT NULL,
      description TEXT NOT NULL,
      modules INTEGER DEFAULT 0,
      rating TEXT DEFAULT '4.9',
      accent TEXT DEFAULT 'violet',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Videos Table with Foreign Key to Courses
  await runQuery(`
    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      video_url TEXT NOT NULL,
      sequence INTEGER DEFAULT 1,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );
  `);

  // Create Counselling Leads / Student Queries Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      track TEXT NOT NULL,
      level TEXT NOT NULL,
      query TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create FAQs Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Contacts Table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      email TEXT NOT NULL,
      admin_gmail TEXT NOT NULL,
      instagram TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      phone TEXT NOT NULL
    );
  `);

  // Seed Default Admin Account if missing
  const adminRow = await getQuery("SELECT * FROM admin LIMIT 1;");
  if (!adminRow) {
    const defaultPasswordHash = bcrypt.hashSync("prash7878@#", 10);
    await runQuery(
      "INSERT INTO admin (gmail, password_hash) VALUES (?, ?);",
      ["prashantking0880@gmail.com", defaultPasswordHash]
    );
    console.log("✔ Default Admin account created (prashantking0880@gmail.com)");
  }

  // Seed Default Courses if empty
  const courseCount = await getQuery("SELECT COUNT(*) as count FROM courses;");
  if (courseCount.count === 0) {
    const defaultCourses = [
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

    for (const c of defaultCourses) {
      await runQuery(
        "INSERT INTO courses (id, title, level, duration, description, modules, rating, accent) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
        [c.id, c.title, c.level, c.duration, c.description, c.modules, c.rating, c.accent]
      );
    }
    console.log("✔ Default Courses seeded successfully.");

    // Seed sample videos for course c1
    const sampleVideos = [
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
    ];

    for (const v of sampleVideos) {
      await runQuery(
        "INSERT INTO videos (id, course_id, title, description, video_url, sequence, status) VALUES (?, ?, ?, ?, ?, ?, ?);",
        [v.id, v.course_id, v.title, v.description, v.video_url, v.sequence, v.status]
      );
    }
    console.log("✔ Default Course Videos seeded.");
  }

  // Seed Default FAQs if empty
  const faqCount = await getQuery("SELECT COUNT(*) as count FROM faqs;");
  if (faqCount.count === 0) {
    const defaultFaqs = [
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

    for (const f of defaultFaqs) {
      await runQuery("INSERT INTO faqs (id, question, answer) VALUES (?, ?, ?);", [f.id, f.question, f.answer]);
    }
  }

  // Seed Default Contacts if empty
  const contactsRow = await getQuery("SELECT * FROM contacts WHERE id = 1;");
  if (!contactsRow) {
    await runQuery(
      "INSERT INTO contacts (id, email, admin_gmail, instagram, whatsapp, phone) VALUES (1, ?, ?, ?, ?, ?);",
      [
        "prashantking0880@gmail.com",
        "prashantking0880@gmail.com",
        "https://www.instagram.com/prashant_singh_08__/",
        "https://wa.me/917627043971",
        "7627043971",
      ]
    );
  }
}

export default db;
