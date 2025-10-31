//Handles the redirect back from an external auth

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../css/AuthCallback.css';


function AuthCallback() {
    // Read-only access to the URL query string 
    const [searchParams] = useSearchParams();
    // Router helper for programmatic navigation
    const navigate = useNavigate();
    // UI status shown to the user while we inspect the callback
    const [status, setStatus] = useState<string>('Processing...');
    // Optional error message if the provider redirected with an error
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            setError(`Authorization failed: ${error}`);
            setStatus('Authentication failed');
            return;
        }

        if (token) {
            localStorage.setItem('authToken', token);
            setStatus('Authentication successful! Redirecting...');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } else {
            setError('No token received from authentication provider.');
            setStatus('Authentication failed');
        }
    }, [searchParams, navigate]);

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
