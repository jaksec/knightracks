import React from 'react';

interface ProgressBarProps {
  value: number; // Current value
  max: number;   // Maximum value
  classNameBar: string;
  classNameFill: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, classNameBar, classNameFill}) => {
  // Calculate the percentage fill
  const percentage = Math.min((value / max) * 100, 100); // Cap at 100%

  return (
    <div className={`progress-bar ${classNameBar || ''}`}>
      <div className={`fill-bar ${classNameFill || ''}`} style={{ width: `${percentage}%` }} />
    </div>
  );
};

export default ProgressBar;