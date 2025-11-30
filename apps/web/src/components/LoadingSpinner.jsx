// Minimal loading indicator with optional label.

function LoadingSpinner({ size = "medium", text = "Loading..." }) {
    return (
        <div className={`loading-spinner loading-spinner-${size}`}>
            {/* Animated circle (CSS-based) */}
            <div className="spinner"></div>
            {/* Optional helper text */}
            {text && <p className="loading-text">{text}</p>}
        </div>
    );
}

export default LoadingSpinner;
