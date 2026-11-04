import React, { useState } from "react";
import { useRouter } from "next/router";
import { loginUsers } from "@/store/slices/authStore";
import { useAppDispatch, useAppSelector } from "@/store/index";

interface LoginProps {
  onLoginSuccess?: (email: string) => void;
}

interface LoginMessage {
  type: "success" | "info";
  text: string;
}

const LoginPage: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { loading: authLoading } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState<LoginMessage | null>(null);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim()) {
      setMessage({
        type: "info",
        text: "Please enter your email and password.",
      });
      return;
    }

    if (isSignUpMode) {
      setMessage({
        type: "info",
        text: "Sign-up functionality is not available yet.",
      });
      return;
    }

    try {
      const result = await dispatch(
        loginUsers({
          email: trimmedEmail,
          password,
        })
      ).unwrap();

      if (result?.success) {
        setMessage({
          type: "success",
          text: "Signed in successfully to Lieark Crypto Market!",
        });
        router.push("/dashboard");
        onLoginSuccess?.(trimmedEmail);
      } else {
        setMessage({
          type: "info",
          text: "Invalid email or password. Please try again.",
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "string"
          ? error
          : "Failed to sign in. Please check your credentials.";

      setMessage({
        type: "info",
        text: errorMessage,
      });
    }
  };

  const handleForgotPassword = () => {
    setMessage({
      type: "info",
      text: `Password reset functionality will be available soon for ${
        email.trim() || "your email"
      }.`,
    });
  };

  const toggleAuthMode = (mode: boolean) => {
    setIsSignUpMode(mode);
    setMessage(null);
    setPassword("");
    setShowPassword(false);
  };

  return (
    <div className="login-viewport">
      <header className="app-topbar">
        <div className="brand-badge">
          <div className="brand-logo-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>

          <span className="brand-name">Lieark Crypto Market</span>
        </div>

        <div className="market-status-pill">
          <span className="pulse-dot" />
          <span>Live Market Connected</span>
        </div>
      </header>

      <div className="login-card-container">
        <div className="login-card">
          <div className="card-header">
            <div className="card-brand-logo">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>

            <h1 className="card-title">Lieark Crypto Market</h1>

            <p className="card-subtitle">
              {isSignUpMode
                ? "Create your account to start trading"
                : "Sign in to access your trading account"}
            </p>
          </div>

          {message && (
            <div
              className={`alert-banner ${message.type}`}
              role="alert"
              aria-live="polite"
            >
              {message.type === "success" ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}

              <span>{message.text}</span>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>

              <div className="input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  disabled={authLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>

              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input has-eye"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete={
                    isSignUpMode ? "new-password" : "current-password"
                  }
                  disabled={authLoading}
                />

                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  title={showPassword ? "Hide password" : "Show password"}
                  disabled={authLoading}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {!isSignUpMode && (
              <div className="forgot-password-row">
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={handleForgotPassword}
                  disabled={authLoading}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>

                  <span>Forgot Password?</span>
                </button>
              </div>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={authLoading}
            >
              {authLoading ? (
                <>
                  <div className="spinner" />
                  <span>Processing...</span>
                </>
              ) : isSignUpMode ? (
                <span>Create Account</span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="card-footer">
            {isSignUpMode ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="signup-link"
                  onClick={() => toggleAuthMode(false)}
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                <div className="flex text-center items-center text-sm text-gray-500">
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    className="signup-link"
                    onClick={() => toggleAuthMode(true)}
                  >
                    Sign Up
                  </button>
                </div>
                <div className="flex text-center items-center text-sm text-gray-500">
                  <p>
                    <span className="font-bold">Dummy credentials: </span>
                    <span>mantashubham@gmail.com / Shubham@123</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <footer className="app-bottom-notice">
        © 2026 Lieark Crypto Market. All rights reserved. Secure Trading Portal.
      </footer>
    </div>
  );
};

export default LoginPage;
