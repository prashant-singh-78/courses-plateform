import React, { useState } from "react";
import { Eye, EyeOff, KeyRound, Lock, Mail, ShieldAlert, Sparkles, X, Check } from "lucide-react";
import { getAdminAuth, updateAdminCredentials, verifyAdminLogin } from "../services/store";

export function AdminLoginModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState("login"); // 'login' | 'setup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [setupSuccess, setSetupSuccess] = useState("");

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const res = verifyAdminLogin(email, password);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || "Authentication failed. Check your Gmail ID & Password.");
    }
  };

  const handleSetupNewCredentials = (e) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) {
      setError("Please enter a valid Gmail address.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    // Hash & update local credentials privately in user's browser localStorage
    updateAdminCredentials(email, password);
    setSetupSuccess("New Admin Gmail & Password saved securely on your device!");
    setTimeout(() => {
      setSetupSuccess("");
      setMode("login");
    }, 1500);
  };

  const adminAuth = getAdminAuth();

  return (
    <div className="admin-modal-overlay">
      <div className="admin-login-card">
        <div className="admin-login-card__header">
          <div className="admin-login-badge">
            <Sparkles size={16} /> Restricted Admin Portal
          </div>
          <button className="close-btn" onClick={onClose} type="button" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="admin-login-card__body">
          {mode === "login" ? (
            <>
              <h2>Admin Login</h2>
              <p>Sign in with your private Admin Gmail address and password.</p>

              {error && (
                <div className="login-error-alert">
                  <ShieldAlert size={16} />
                  <span>{error}</span>
                </div>
              )}

              {setupSuccess && (
                <div className="admin-alert admin-alert--success">
                  <Check size={16} />
                  <span>{setupSuccess}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="admin-form">
                <label className="field">
                  <span>Admin Gmail Address</span>
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
                      placeholder="Enter admin password"
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

                <button type="submit" className="button button--full">
                  Sign In to Dashboard →
                </button>
              </form>

              <div className="modal-setup-link">
                <button
                  type="button"
                  className="text-link-btn"
                  onClick={() => {
                    setError("");
                    setMode("setup");
                    setEmail("");
                    setPassword("");
                  }}
                >
                  <KeyRound size={14} /> Set / Change Admin Credentials Privately
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>Local Password Setup</h2>
              <p>Set your custom Gmail & Password locally on your device. It will be encrypted using <strong>bcrypt</strong> and saved in your browser.</p>

              {error && (
                <div className="login-error-alert">
                  <ShieldAlert size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSetupNewCredentials} className="admin-form">
                <label className="field">
                  <span>Your Admin Gmail Address</span>
                  <div className="input-with-icon">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email"
                      placeholder="your-gmail@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </label>

                <label className="field">
                  <span>Your Private Password</span>
                  <div className="input-with-icon">
                    <Lock size={16} className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
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

                <button type="submit" className="button button--full">
                  Save Credentials Privately
                </button>
              </form>

              <div className="modal-setup-link">
                <button
                  type="button"
                  className="text-link-btn"
                  onClick={() => {
                    setError("");
                    setMode("login");
                  }}
                >
                  ← Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
