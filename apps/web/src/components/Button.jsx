// Reusable Button component.

import '../css/Button.css';

function Button({ 
    // Content inside the button 
    children,      
    // Click handler     
    onClick,           
    // Visual variant 
    variant = "primary", 
    // Size variant
    size = "medium",   
     // Disabled state  
    disabled = false,   
    // Additional class names to extend styling
    className = "",
    // Button type attribute 
    type = "button"     
}) {
    return (
        <button 
            // Compose classes using variant and size
            className={`btn btn-${variant} btn-${size} ${className}`}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {/* Render button content */}
            {children}
        </button>
    );
}

export default Button;
