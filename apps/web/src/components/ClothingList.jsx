// renders a horizontal row of ClothingCard items.


import ClothingCard from './ClothingCard.jsx';
import '../css/ClothingList.css';

function ClothingList({ clothing, title, className = "" }) {
    if (!clothing || clothing.length === 0) {
        return (
            <div className={`clothing-list-section ${className}`}>
                {title && <h2 className="section-title">{title}</h2>}
                {/* Empty state */}
                <div className="no-clothing">
                    <p>No clothing available</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`clothing-list-section ${className}`}>
            {title && <h2 className="section-title">{title}</h2>}
            <div className="clothing-list-horizontal">
                {clothing.map((item, index) => (
                    // Delegate card rendering to the shared ClothingCard component
                    <ClothingCard 
                        key={`${item.id}-${index}`} 
                        clothing={item}
                    />
                ))}
            </div>
        </div>
    );
}

export default ClothingList;
