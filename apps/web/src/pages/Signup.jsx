import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import fitted from '../assets/fitted.png';
import searchIcon from '../assets/search.png';
import favoriteIcon from '../assets/favorite.png';
import closetIcon from '../assets/closet.png';
import loginIcon from '../assets/login.png';
import graffiti from '../assets/graffiti.jpg';
import googleLogo from '../assets/googlelogo.png';
import facebookLogo from '../assets/facebooklogo2.png';
import { startSignup, verifyCode, completeSignup, loginWithGoogle, loginWithFacebook } from '../services/authApi';
import { useAuth } from '../contexts/AuthContext';
import '../css/Login.css';

function Signup() {
    const [step, setStep] = useState(1); // 1: name/email, 2: verify code, 3: password
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        code: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const navigate = useNavigate();
    const { setAuthUser } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    // Step 1: Start signup - send verification code
    const handleStartSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await startSignup(formData.name, formData.email);
            setCodeSent(true);
            setStep(2); // Move to verification step
        } catch (err) {
            setError(err.message || 'Failed to send verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify code
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await verifyCode(formData.email, formData.code);
            setStep(3); // Move to password step
        } catch (err) {
            setError(err.message || 'Invalid verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Complete signup with password
    const handleCompleteSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await completeSignup(formData.email, formData.password, formData.name);
            if (response.success && response.user) {
                setAuthUser(response.user);
                // Redirect to home page
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Failed to complete signup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        loginWithGoogle();
    };

    const handleFacebookSignup = () => {
        loginWithFacebook();
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
            setCodeSent(false);
            setFormData({ ...formData, code: '' });
        } else if (step === 3) {
            setStep(2);
            setFormData({ ...formData, password: '' });
        }
        setError('');
    };

    return (
        <div className="login-page">
            {/* Custom NavBar for Signup Page */}
            <header className='nav login-nav'>
                <nav className="nav-inner login-nav-inner">
                    {/* Logo on the left */}
                    <div className="login-nav-left">
                        <Link to="/">
                            <img src={fitted} alt="Fitted" className="navbar-logo" />
                        </Link>
                    </div>

                    {/* Right side navigation buttons */}
                    <div className='nav-right'>
                        <Link to="/search" aria-label="Search">
                            <img src={searchIcon} alt="Search" className="search-icon" />
                        </Link>
                        <Link to="/favorites" aria-label="Favorites">
                            <img src={favoriteIcon} alt="Favorites" className="favorite-icon" />
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

            {/* Signup Content */}
            <div className="login-content">
                <div className="login-form-container">
                    <h1 className="login-title">Sign Up</h1>

                    {error && (
                        <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {/* Step 1: Name and Email */}
                    {step === 1 && (
                        <form className="login-form" onSubmit={handleStartSignup}>
                            <div className="form-group">
                                <label htmlFor="name">Full Name*</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Full Name*"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address*</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Email Address*"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button type="submit" className="signup-submit-btn" disabled={loading}>
                                {loading ? 'Sending code...' : 'Continue'}
                            </button>

                            <div className="or-divider">
                                <span>OR</span>
                            </div>

                            <p className="signup-with-text">Sign up with</p>

                            <div className="social-login-buttons">
                                <button type="button" className="social-btn" onClick={handleGoogleSignup}>
                                    <img src={googleLogo} alt="Google" />
                                </button>
                                <button type="button" className="social-btn social-btn-facebook" onClick={handleFacebookSignup}>
                                    <img src={facebookLogo} alt="Facebook" className="facebook-logo" />
                                </button>
                            </div>

                            <div className="signup-link">
                                <p>Already have an account? <Link to="/login" className="link-button">Log In</Link></p>
                            </div>
                        </form>
                    )}

                    {/* Step 2: Verify Code */}
                    {step === 2 && (
                        <form className="login-form" onSubmit={handleVerifyCode}>
                            {codeSent && (
                                <div style={{ marginBottom: '1rem', textAlign: 'center', color: '#666' }}>
                                    <p>We've sent a 6-digit verification code to:</p>
                                    <p style={{ fontWeight: 'bold' }}>{formData.email}</p>
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="code">Verification Code*</label>
                                <input
                                    type="text"
                                    id="code"
                                    name="code"
                                    placeholder="Enter 6-digit code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    required
                                    maxLength="6"
                                    pattern="[0-9]{6}"
                                    disabled={loading}
                                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                                />
                            </div>

                            <button type="submit" className="signup-submit-btn" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>

                            <button
                                type="button"
                                className="link-button"
                                onClick={handleBack}
                                style={{ marginTop: '1rem' }}
                            >
                                ← Back
                            </button>
                        </form>
                    )}

                    {/* Step 3: Set Password */}
                    {step === 3 && (
                        <form className="login-form" onSubmit={handleCompleteSignup}>
                            <div className="form-group">
                                <label htmlFor="password">Password*</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        placeholder="Password*"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength="8"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

                            <button type="submit" className="signup-submit-btn" disabled={loading}>
                                {loading ? 'Completing signup...' : 'Complete Sign Up'}
                            </button>

                            <button
                                type="button"
                                className="link-button"
                                onClick={handleBack}
                                style={{ marginTop: '1rem' }}
                            >
                                ← Back
                            </button>
                        </form>
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

export default Signup;
