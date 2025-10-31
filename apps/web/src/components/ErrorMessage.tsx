//  error banner with optional retry action

import '../css/ErrorMessage.css';

function ErrorMessage({ message, onRetry, className = "" }) {
    return (
        <div className={`error-message ${className}`}>
            <div className="error-content">
                {/* Visual indicator */}
                <div className="error-icon">⚠️</div>
                {/* Human-readable error description */}
                <p className="error-text">{message}</p>
                {onRetry && (
                    <button 
                        className="error-retry-btn"
                        onClick={onRetry}
                    >
                        {/* Trigger the provided retry callback */}
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}

export default ErrorMessage;
