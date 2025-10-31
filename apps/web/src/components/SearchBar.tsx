// Controlled search input with clear (✕) button.

import '../css/SearchBar.css';
import React from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
  value?: string;
}

function SearchBar({ placeholder = "Search for movies...", onSearch, className = "", value = "" }: SearchBarProps) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (onSearch) {
            onSearch(value);
        }
    };

    const handleClear = () => {
        if (onSearch) {
            onSearch("");
        }
    };

    return (
        <div className={`search-bar-container ${className}`}>
            <div className="search-input-wrapper">
                <input 
                    type="text" 
                    placeholder={placeholder}
                    className='search-bar-input'
                    value={value}
                    onChange={handleInputChange}
                />
                {/* Clear button appears only when there is text */}
                {value && (
                    <button 
                        className="search-cancel-btn"
                        onClick={handleClear}
                        aria-label="Clear search"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}

export default SearchBar;
