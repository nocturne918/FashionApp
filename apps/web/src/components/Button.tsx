// Reusable Button component.

import '../css/Button.css';
import type { ReactNode, MouseEventHandler } from 'react';


interface ButtonProps {
    children: ReactNode;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

function Button({
    children,
    onClick,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    className = '',
    type = 'button',
}: ButtonProps) {
    return (
        <button
            className={`btn btn-${variant} btn-${size} ${className}`}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {children}
        </button>
    );
}

export default Button;
