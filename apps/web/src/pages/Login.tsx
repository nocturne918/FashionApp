import { useState } from 'react';
import { Link } from 'react-router-dom';
import fitted from '../assets/fitted.png';
import searchIcon from '../assets/search.png';
import favoriteIcon from '../assets/favorite.png';
import closetIcon from '../assets/closet.png';
import loginIcon from '../assets/login.png';
import graffiti from '../assets/graffiti.jpg';
import googleLogo from '../assets/googlelogo.png';
import facebookLogo from '../assets/facebooklogo2.png';
import '../css/Login.css';

function Login() {
    const [showOverlay, setShowOverlay] = useState(true);
    const [showSignup, setShowSignup] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loginFormData, setLoginFormData] = useState({
        email: '',
        password: ''
    });
    const [signupFormData, setSignupFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    const handleLoginChange = (e) => {
        setLoginFormData({
            ...loginFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignupChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setSignupFormData({
            ...signupFormData,
            [e.target.name]: value
        });
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt:', loginFormData);
        // Add login logic here
    };

    const handleSignupSubmit = (e) => {
        e.preventDefault();
        console.log('Signup attempt:', signupFormData);
        // Add signup logic here
    };

    return (
        <div className="login-page">
            {/* Custom NavBar for Login Page */}
            <header className='nav login-nav'>
                <nav className="nav-inner login-nav-inner">
                    {/* Logo on the left */}
                    <div className="login-nav-left">
                        <Link to="/">
                            <img src={fitted} alt="Fitted" className="navbar-logo"/>
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
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name*</label>
                                    <input 
                                        type="text" 
                                        id="firstName" 
                                        name="firstName"
                                        placeholder="First Name*" 
                                        value={signupFormData.firstName}
                                        onChange={handleSignupChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name*</label>
                                    <input 
                                        type="text" 
                                        id="lastName" 
                                        name="lastName"
                                        placeholder="Last Name*" 
                                        value={signupFormData.lastName}
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
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                {showPassword ? (
                                                    <>
                                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                                    </>
                                                ) : (
                                                    <>
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                        <circle cx="12" cy="12" r="3"/>
                                                    </>
                                                )}
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                <button type="submit" className="signup-submit-btn">
                                    Sign Up
                                </button>
                                
                                <div className="or-divider">
                                    <span>OR</span>
                                </div>
                                
                                <p className="signup-with-text">Sign up with</p>
                                
                                <div className="social-login-buttons">
                                    <button type="button" className="social-btn">
                                        <img src={googleLogo} alt="Google" />
                                    </button>
                                    <button type="button" className="social-btn social-btn-facebook">
                                        <img src={facebookLogo} alt="Facebook" className="facebook-logo" />
                                    </button>
                                </div>
                                
                                <div className="signup-link">
                                    <p>Already have an account? <button type="button" className="link-button" onClick={() => setShowSignup(false)}>Log In</button></p>
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
                                
                                <div className="or-divider">
                                    <span>OR</span>
                                </div>
                                
                                <p className="signup-with-text">Log in with</p>
                                
                                <div className="social-login-buttons">
                                    <button type="button" className="social-btn">
                                        <img src={googleLogo} alt="Google" />
                                    </button>
                                    <button type="button" className="social-btn social-btn-facebook">
                                        <img src={facebookLogo} alt="Facebook" className="facebook-logo" />
                                    </button>
                                </div>
                                
                                <div className="signup-link">
                                    <p>Don't have an account? <button type="button" className="link-button" onClick={() => setShowSignup(true)}>Sign up here</button></p>
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
