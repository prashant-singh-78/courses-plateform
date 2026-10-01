import React, { useState } from "react";
import { Eye, EyeOff, KeyRound, Lock, Mail, ShieldAlert, Sparkles, X, Check } from "lucide-react";
import { loginAdmin } from "../services/api";

export function AdminLoginModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginAdmin(email, password);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || "Admin authentication failed.");
      }
    } catch (err) {
      setError(err.message || "Invalid Admin credentials or network error.");
    } finally {
      setLoading(false);
    }
  };

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
          <h2>Admin Login</h2>
          <p>Sign in with your verified Admin Gmail address and password.</p>

          {error && (
            <div className="login-error-alert">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="admin-form">
            <label className="field">
              <span>Admin Gmail Address</span>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  placeholder="prashantking0880@gmail.com"
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

            <button type="submit" className="button button--full" disabled={loading}>
              {loading ? "Authenticating Admin..." : "Sign In to Admin Dashboard →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
