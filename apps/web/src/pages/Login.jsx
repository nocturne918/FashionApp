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
import { login, loginWithGoogle, loginWithFacebook } from '../services/authApi';
import { useAuth } from '../contexts/AuthContext';
import '../css/Login.css';

function Login() {
    const [loginFormData, setLoginFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setAuthUser } = useAuth();

    const handleLoginChange = (e) => {
        setLoginFormData({
            ...loginFormData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login(loginFormData.email, loginFormData.password);
            if (response.success && response.user) {
                setAuthUser(response.user);
                // Redirect to home page
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        loginWithGoogle();
    };

    const handleFacebookLogin = () => {
        loginWithFacebook();
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
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Log in to your FITTED account</p>
                    
                    {error && (
                        <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}
                    
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
                                disabled={loading}
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
                                disabled={loading}
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
                        
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                        
                        <div className="or-divider">
                            <span>OR</span>
                        </div>
                        
                        <p className="signup-with-text">Log in with</p>
                        
                        <div className="social-login-buttons">
                            <button type="button" className="social-btn" onClick={handleGoogleLogin}>
                                <img src={googleLogo} alt="Google" />
                            </button>
                            <button type="button" className="social-btn social-btn-facebook" onClick={handleFacebookLogin}>
                                <img src={facebookLogo} alt="Facebook" className="facebook-logo" />
                            </button>
                        </div>
                        
                        <div className="signup-link">
                            <p>Don't have an account? <Link to="/signup" className="link-button">Sign up here</Link></p>
                        </div>
                    </form>
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
