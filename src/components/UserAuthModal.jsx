import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldAlert, Sparkles, User, X } from "lucide-react";
import { signupUser, unifiedLogin } from "../services/api";

export function UserAuthModal({ isOpen, onClose, onUserSuccess, onAdminSuccess }) {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await unifiedLogin(email, password);
        if (res.type === "admin") {
          onAdminSuccess(res.data);
        } else {
          onUserSuccess(res.data);
        }
      } else {
        const res = await signupUser(name, email, password);
        onUserSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || "Invalid Email or Password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-login-card">
        <div className="admin-login-card__header">
          <div className="admin-login-badge">
            <Sparkles size={16} /> Skill.Nova Account
          </div>
          <button className="close-btn" onClick={onClose} type="button" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="admin-login-card__body">
          <h2>{mode === "login" ? "Sign In" : "Create Learner Account"}</h2>
          <p>
            {mode === "login"
              ? "Sign in with your email & password (User or Admin)."
              : "Join Skill.Nova to start your guided learning journey."}
          </p>

          {error && (
            <div className="login-error-alert">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-form">
            {mode === "signup" && (
              <label className="field">
                <span>Full Name</span>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </label>
            )}

            <label className="field">
              <span>Email Address</span>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="field">
              <span>Password</span>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="icon-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button type="submit" className="button button--full" disabled={loading}>
              {loading
                ? "Authenticating..."
                : mode === "login"
                ? "Sign In to Skill.Nova →"
                : "Create Free Learner Account →"}
            </button>
          </form>

          <div className="modal-setup-link">
            {mode === "login" ? (
              <button
                type="button"
                className="text-link-btn"
                onClick={() => {
                  setError("");
                  setMode("signup");
                }}
              >
                New learner? Create an account
              </button>
            ) : (
              <button
                type="button"
                className="text-link-btn"
                onClick={() => {
                  setError("");
                  setMode("login");
                }}
              >
                Already have an account? Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
