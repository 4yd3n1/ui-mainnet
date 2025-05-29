import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => (
  <div className="w-full bg-gray-700 rounded-full h-4">
    <div
      className="bg-green-500 h-4 rounded-full transition-all"
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
);

export default ProgressBar; 