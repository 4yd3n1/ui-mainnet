import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <div className="bg-gray-800 rounded-lg p-4 shadow text-center">
    <div className="text-sm text-gray-400">{label}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

export default StatCard; 