import React from 'react';

interface ProgressBarProps {
  value: number; // Current value
  max: number;   // Maximum value
  classNameBar: string;
  classNameFill: string;
  showGrams?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, classNameBar, classNameFill, showGrams }) => {
  const percentage = Math.min((value / max) * 100, 100); // Cap at 100%

  return (
    <div className={`progress-bar ${classNameBar || ''}`}>
      <div className={`fill-bar ${classNameFill || ''}`} style={{ width: `${percentage}%` }} />
      <div className="progress-line" style={{ left: `${percentage}%` }} />
      <div
        className="progress-number"
        style={{
          left: `${percentage}%`,
          color: value >= max ? 'green' : 'white',
        }}
      >
        {value}{showGrams ? 'g' : ''} {/* Ensure this value is being passed */}
      </div>
    </div>
  );
};

export default ProgressBar;