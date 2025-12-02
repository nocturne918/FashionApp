import React, { useState } from "react";
import { Logo } from "./Logo";
import { Icon } from "@iconify/react";
import { authClient } from "../lib/auth-client";

interface LoginViewProps {
  onSwitchToSignup: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      // Report failed attempt to server so it can increment counters and lock if needed
      try {
        const resp = await fetch(
          (import.meta.env.VITE_API_URL || "http://localhost:3000") +
            "/api/auth/failed-attempt",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );
        if (resp.status === 423) {
          setError(
            "Account locked due to multiple failed sign-ins. Reset your password to unlock."
          );
        } else {
          const json = await resp.json().catch(() => ({}));
          const attempts = json.attempts || 0;
          const left = Math.max(0, 3 - attempts);
          setError(
            (error.message || "Authentication failed") +
              ` — ${left} attempts left`
          );
        }
      } catch {
        setError(error.message || "Authentication failed");
      }
      setIsLoading(false);
    }
    // Success will trigger AuthContext update via useSession
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: window.location.origin,
    });

    if (error) {
      setError(error.message || "Google authentication failed");
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      setError("Guest access is currently disabled.");
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white border-2 border-black hard-shadow flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        {/* Left Side: Visuals */}
        <div className="md:w-1/2 bg-black text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-black uppercase mb-2">
              Preview
              <br />
              Access
            </h2>
            <div className="h-1 w-20 bg-blue-600 mb-6"></div>
            <p className="font-mono text-sm opacity-80">
              Enter the archive. Build your rotation. Connect with the culture.
            </p>
          </div>

          <div className="relative z-10 font-mono text-xs opacity-50 mt-12 md:mt-0">
            SYSTEM STATUS: ONLINE
            <br />
            VERSION: 0.2.0
          </div>

          {/* Abstract background element */}
          <div className="absolute -bottom-10 -right-10 w-64 h-64 border-20 border-blue-600 rounded-full opacity-20 blur-xl"></div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px]">
          <div className="mb-8 scale-75 origin-left">
            <Logo />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-bold text-xs uppercase mb-2">
                Email Address
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="USER@FITTED.COM"
                className="w-full bg-white border-2 border-black p-3 font-mono text-sm focus:outline-none focus:bg-blue-50 focus:border-blue-600 transition-colors placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block font-bold text-xs uppercase mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border-2 border-black p-3 font-mono text-sm focus:outline-none focus:bg-blue-50 focus:border-blue-600 transition-colors placeholder:text-gray-400"
              />
            </div>

            {error && (
              <div className="bg-red-500 text-white p-3 text-xs font-mono border-2 border-black flex items-center gap-2">
                <Icon icon="lucide:alert-triangle" width={14} height={14} />{" "}
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-bold uppercase py-4 border-2 border-transparent hover:bg-blue-600 hover:border-blue-600 hard-shadow active:translate-y-0.5 active:shadow-none transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                "Authenticating..."
              ) : (
                <>
                  Enter The Archive{" "}
                  <Icon icon="lucide:arrow-right" width={18} height={18} />
                </>
              )}
            </button>
          </form>

          {/* Guest Access Divider */}
          <div className="relative flex py-5 items-center">
            <div className="grow border-t border-gray-300"></div>
            <span className="shrink-0 mx-4 text-gray-400 text-[10px] font-mono uppercase tracking-widest">
              or
            </span>
            <div className="grow border-t border-gray-300"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white text-black font-bold uppercase py-3 border-2 border-black hover:bg-gray-50 hard-shadow active:translate-y-0.5 active:shadow-none transition-all flex justify-center items-center gap-2 text-xs tracking-widest disabled:opacity-50 mb-3"
          >
            <Icon icon="logos:google-icon" width={16} height={16} /> Continue
            with Google
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full bg-white text-gray-600 font-bold uppercase py-3 border-2 border-dashed border-gray-300 hover:border-black hover:text-black hover:bg-gray-50 transition-all flex justify-center items-center gap-2 text-xs tracking-widest disabled:opacity-50"
          >
            <Icon icon="lucide:ticket" width={16} height={16} /> Use Guest Pass
          </button>

          <div className="mt-8 pt-6 border-t-2 border-gray-200 flex justify-between items-center text-xs font-mono text-gray-500">
            <button
              onClick={() => {
                setForgotMode(!forgotMode);
                setForgotMessage("");
                setForgotEmail(email);
              }}
              className="hover:text-black hover:underline"
            >
              FORGOT PASS?
            </button>
            <button
              onClick={onSwitchToSignup}
              className="flex items-center gap-1 hover:text-black hover:underline uppercase"
            >
              <Icon icon="lucide:lock" width={12} height={12} /> SIGN UP
            </button>
          </div>

          {forgotMode && (
            <div className="mt-4 p-4 border-2 border-gray-200 bg-white">
              <h3 className="font-bold uppercase text-sm mb-2">
                Reset Password
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Enter your email and we'll send a password reset link. After you
                reset your password, click "I've reset" to unlock your account.
              </p>
              <input
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full p-2 border-2 border-black mb-3"
              />
              {forgotMessage && (
                <div className="text-xs mb-2">{forgotMessage}</div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    setForgotLoading(true);
                    setForgotMessage("");
                    try {
                      const resp = await fetch(
                        (import.meta.env.VITE_API_URL ||
                          "http://localhost:3000") + "/api/auth/password-reset",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: forgotEmail }),
                        }
                      );
                      if (resp.ok) {
                        setForgotMessage(
                          "If an account exists, a password reset email was sent."
                        );
                      } else {
                        const j = await resp.json().catch(() => ({}));
                        setForgotMessage(
                          j.error || "Unable to request password reset."
                        );
                      }
                    } catch {
                      setForgotMessage("Network error sending reset email.");
                    } finally {
                      setForgotLoading(false);
                    }
                  }}
                  disabled={forgotLoading || !forgotEmail}
                  className="px-3 py-2 border-2 border-black bg-white"
                >
                  Send Reset
                </button>

                <button
                  onClick={async () => {
                    if (!forgotEmail)
                      return setForgotMessage("Enter your email first");
                    setForgotLoading(true);
                    setForgotMessage("");
                    try {
                      const resp = await fetch(
                        (import.meta.env.VITE_API_URL ||
                          "http://localhost:3000") + "/api/auth/reset-lock",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: forgotEmail }),
                        }
                      );
                      if (resp.ok) {
                        setForgotMessage(
                          "Account unlocked. You can now sign in with your new password."
                        );
                        setForgotMode(false);
                      } else {
                        const j = await resp.json().catch(() => ({}));
                        setForgotMessage(
                          j.error || "Unable to unlock account."
                        );
                      }
                    } catch {
                      setForgotMessage("Network error while unlocking.");
                    } finally {
                      setForgotLoading(false);
                    }
                  }}
                  disabled={forgotLoading || !forgotEmail}
                  className="px-3 py-2 border-2 border-black bg-white"
                >
                  I've reset — Unlock
                </button>

                <button
                  onClick={() => setForgotMode(false)}
                  className="px-3 py-2 border-2 border-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
