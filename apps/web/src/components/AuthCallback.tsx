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
    const [status, setStatus] = useState('Processing...');
    // Optional error message if the provider redirected with an error
    const [error, setError] = useState(null);

    useEffect(() => {
        // Parse and validate the callback parameters.
        const handleCallback = async () => {
            try {
                // Typical OAuth-style params; kept for compatibility
                const code = searchParams.get('code');
                const error = searchParams.get('error');
                const state = searchParams.get('state');

                // If the provider returned an error, surface it and stop
                if (error) {
                    setError(`Authorization failed: ${error}`);
                    setStatus('Authorization failed');
                    return;
                }

                // If no code is present, nothing to process
                if (!code) {
                    setError('No code received');
                    setStatus('Authorization failed');
                    return;
                }

                // We no longer exchange codes for tokens in the client.
                // Instead we confirm the redirect worked and inform the user.
                setStatus('API Key authentication is now active');
                
                //redirect to the homepage 
                setTimeout(() => {
                    navigate('/');
                }, 2000);

            } catch (error) {
                // Catch-all for unexpected issues 
                console.error('Callback error:', error);
                setError(error.message);
                setStatus('Authentication failed');
            }
        };

        handleCallback();
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
