import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import fitted from "../assets/fitted.png";
import searchIcon from "../assets/search.png";
import favoriteIcon from "../assets/favorite.png";
import closetIcon from "../assets/closet.png";
import loginIcon from "../assets/login.png";
import graffiti from "../assets/graffiti.jpg";
import googleLogo from "../assets/googlelogo.png";
import facebookLogo from "../assets/facebooklogo2.png";
import "../css/Login.css";

function Login() {
  const [showOverlay, setShowOverlay] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });
  const [signupFormData, setSignupFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [signupLoading, setSignupLoading] = useState<boolean>(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<boolean>(false);
  const [signupStep, setSignupStep] = useState<'start' | 'verify' | 'complete'>('start');
  const [signupCode, setSignupCode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginFormData({
      ...loginFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setSignupFormData({
      ...signupFormData,
      [e.target.name]: value,
    });
  };

    const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await login(loginFormData.email, loginFormData.password);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError(null);
    setSignupSuccess(false);
    try {
      if (signupStep === 'start') {
        const res = await fetch('/api/auth/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: signupFormData.name,
            email: signupFormData.email,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to start signup');
        }
        setSignupSuccess(true);
        setSignupStep('verify');
      } else if (signupStep === 'verify') {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: signupFormData.email,
            code: signupCode,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Invalid code');
        }
        setSignupSuccess(true);
        setSignupStep('complete');
      } else if (signupStep === 'complete') {
        const res = await fetch('/api/auth/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: signupFormData.email,
            password: signupFormData.password,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
        }
        setSignupSuccess(true);
        // Optionally, redirect to login or dashboard
        alert('Signup complete! You can now log in.');
        setShowSignup(false);
        setSignupStep('start');
        setSignupCode('');
      }
    } catch (err: any) {
      setSignupError(err.message || 'Signup failed');
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Custom NavBar for Login Page */}
      <header className="nav login-nav">
        <nav className="nav-inner login-nav-inner">
          {/* Logo on the left */}
          <div className="login-nav-left">
            <Link to="/">
              <img src={fitted} alt="Fitted" className="navbar-logo" />
            </Link>
          </div>

          {/* Right side navigation buttons */}
          <div className="nav-right">
            <Link to="/search" aria-label="Search">
              <img src={searchIcon} alt="Search" className="search-icon" />
            </Link>
            <Link to="/favorites" aria-label="Favorites">
              <img
                src={favoriteIcon}
                alt="Favorites"
                className="favorite-icon"
              />
            </Link>
            <Link to="/closet" aria-label="Bag">
              <img src={closetIcon} alt="Bag" className="closet-icon" />
            </Link>
            <Link to="/login" aria-label="Login">
              <img src={loginIcon} alt="Login" className="login-icon" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Login Content */}
      <div className="login-content">
        <div className="login-form-container">
          {/* Black Overlay */}
          {showOverlay && (
            <div className="login-overlay">
              <button
                className="overlay-btn signup-btn"
                onClick={() => {
                  setShowOverlay(false);
                  setShowSignup(true);
                }}
              >
                Sign Up
              </button>
              <button
                className="overlay-btn login-btn-overlay"
                onClick={() => {
                  setShowOverlay(false);
                  setShowSignup(false);
                }}
              >
                Log In
              </button>
            </div>
          )}

          {/* Signup Form */}
          {!showOverlay && showSignup ? (
            <>
              <h1 className="login-title">Sign Up</h1>

              <form className="login-form" onSubmit={handleSignupSubmit}>
                {signupStep === 'start' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="signup-name">Name*</label>
                      <input
                        type="text"
                        id="signup-name"
                        name="name"
                        placeholder="Name*"
                        value={signupFormData.name}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="signup-email">Email Address*</label>
                      <input
                        type="email"
                        id="signup-email"
                        name="email"
                        placeholder="Email Address*"
                        value={signupFormData.email}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>
                  </>
                )}

                {signupStep === 'verify' && (
                  <div className="form-group">
                    <label htmlFor="signup-code">Verification Code*</label>
                    <input
                      type="text"
                      id="signup-code"
                      name="code"
                      placeholder="Enter 6-digit code*"
                      value={signupCode}
                      onChange={(e) => setSignupCode(e.target.value)}
                      required
                    />
                  </div>
                )}

                {signupStep === 'complete' && (
                  <div className="form-group">
                    <label htmlFor="signup-password">Password*</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="signup-password"
                        name="password"
                        placeholder="Password*"
                        value={signupFormData.password}
                        onChange={handleSignupChange}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          {showPassword ? (
                            <>
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </>
                          ) : (
                            <>
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {signupError && <div className="error-message">{signupError}</div>}
                {signupSuccess && signupStep === 'start' && <div className="success-message">Verification code sent! Check your email.</div>}
                {signupSuccess && signupStep === 'verify' && <div className="success-message">Code verified! Set your password.</div>}

                <button type="submit" className="signup-submit-btn" disabled={signupLoading}>
                  {signupLoading ? 'Processing...' : signupStep === 'start' ? 'Send Code' : signupStep === 'verify' ? 'Verify Code' : 'Complete Signup'}
                </button>

                {signupStep !== 'start' && (
                  <button type="button" className="link-button" onClick={() => setSignupStep('start')}>
                    Back
                  </button>
                )}

                <div className="or-divider">
                  <span>OR</span>
                </div>

                <p className="signup-with-text">Sign up with</p>

                <div className="social-login-buttons">
                  <button type="button" className="social-btn" onClick={loginWithGoogle}>
                    <img src={googleLogo} alt="Google" />
                  </button>
                  <button
                    type="button"
                    className="social-btn social-btn-facebook"
                    onClick={loginWithFacebook}
                  >
                    <img
                      src={facebookLogo}
                      alt="Facebook"
                      className="facebook-logo"
                    />
                  </button>
                </div>

                <div className="signup-link">
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => setShowSignup(false)}
                    >
                      Log In
                    </button>
                  </p>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Login Form */}
              <h1 className="login-title">Welcome Back</h1>
              <p className="login-subtitle">Log in to your FITTED account</p>

              <form className="login-form" onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={loginFormData.email}
                    onChange={handleLoginChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={loginFormData.password}
                    onChange={handleLoginChange}
                    required
                  />
                </div>

                <div className="form-options">
                  <label className="remember-me">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <button type="submit" className="login-btn">
                  Log In
                </button>

                {loginError && <div className="error-message">{loginError}</div>}

                <div className="or-divider">
                  <span>OR</span>
                </div>

                <p className="signup-with-text">Log in with</p>

                <div className="social-login-buttons">
                  <button type="button" className="social-btn" onClick={loginWithGoogle}>
                    <img src={googleLogo} alt="Google" />
                  </button>
                  <button
                    type="button"
                    className="social-btn social-btn-facebook"
                    onClick={loginWithFacebook}
                  >
                    <img
                      src={facebookLogo}
                      alt="Facebook"
                      className="facebook-logo"
                    />
                  </button>
                </div>

                <div className="signup-link">
                  <p>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => setShowSignup(true)}
                    >
                      Sign up here
                    </button>
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Graffiti Background */}
      <div className="login-graffiti-background">
        <img src={graffiti} alt="Graffiti" className="login-graffiti-image" />
      </div>
    </div>
  );
}

export default Login;
