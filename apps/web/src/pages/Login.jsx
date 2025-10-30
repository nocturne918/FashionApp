import { useState } from 'react';
import { Link } from 'react-router-dom';
import fitted from '../assets/fitted.png';
import searchIcon from '../assets/search.png';
import favoriteIcon from '../assets/favorite.png';
import closetIcon from '../assets/closet.png';
import loginIcon from '../assets/login.png';
import graffiti from '../assets/graffiti.jpg';
import '../css/Login.css';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt:', formData);
        // Add login logic here
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
                    <p className="login-subtitle">Sign in to your FITTED account</p>
                    
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email"
                                placeholder="Enter your email" 
                                value={formData.email}
                                onChange={handleChange}
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
                                value={formData.password}
                                onChange={handleChange}
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
                            Sign In
                        </button>
                        
                        <div className="signup-link">
                            <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
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
