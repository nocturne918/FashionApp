import React from 'react';
import fittedLogo from '/assets/fitted.png';

export const Logo: React.FC = () => {
  return (
    <img src={fittedLogo} alt="FITTED" className="h-1 object-contain" />
  );
};
