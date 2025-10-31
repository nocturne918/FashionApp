//Handles the redirect back from an external auth

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUser } from '../services/authApi';
import '../css/AuthCallback.css';

function AuthCallback() {
    // Read-only access to the URL query string 
    const [searchParams] = useSearchParams();
    // Router helper for programmatic navigation
    const navigate = useNavigate();
    const { setAuthToken, setAuthUser } = useAuth();
    // UI status shown to the user while we inspect the callback
    const [status, setStatus] = useState('Processing...');
    // Optional error message if the provider redirected with an error
    const [error, setError] = useState(null);

    useEffect(() => {
        // Parse and validate the callback parameters.
        const handleCallback = async () => {
            try {
                // Check for JWT token from OAuth callback
                const token = searchParams.get('token');
                const errorParam = searchParams.get('error');

                // If the provider returned an error, surface it and stop
                if (errorParam) {
                    setError(`Authorization failed: ${errorParam}`);
                    setStatus('Authorization failed');
                    return;
                }

                // If no token is present, nothing to process
                if (!token) {
                    setError('No authentication token received');
                    setStatus('Authorization failed');
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                    return;
                }

                // Store the token
                setAuthToken(token);
                
                // Fetch user info with the token
                try {
                    const userData = await getCurrentUser(token);
                    if (userData.user) {
                        setAuthUser(userData.user);
                        setStatus('Authentication successful!');
                        
                        // Redirect to the homepage after success
                        setTimeout(() => {
                            navigate('/');
                        }, 1500);
                    } else {
                        throw new Error('No user data received');
                    }
                } catch (userError) {
                    console.error('Error fetching user:', userError);
                    setError('Failed to retrieve user information');
                    setStatus('Authentication incomplete');
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                }

            } catch (error) {
                // Catch-all for unexpected issues 
                console.error('Callback error:', error);
                setError(error.message || 'An unexpected error occurred');
                setStatus('Authentication failed');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        };

        handleCallback();
    }, [searchParams, navigate, setAuthToken, setAuthUser]);

    //Shows an error block if present; otherwise a success message
    
    return (
        <div className="auth-callback">
            <div className="auth-callback-container">
                <h1>StockX API Status</h1>
                <div className="status-message">
                    {error ? (
                        <div className="error">
                            <p>❌ {error}</p>
                            {/* allow the user to manually return home */}
                            <button onClick={() => navigate('/')}>
                                Return to Home
                            </button>
                        </div>
                    ) : (
                        <div className="success">
                            <p>✅ {status}</p>
                            <div className="spinner"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuthCallback;
