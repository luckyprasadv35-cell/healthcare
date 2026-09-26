import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, icon, color }) => {
  return (
    <div className={`bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-lg`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${color}`}></div>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <div className="text-gray-500">{icon}</div>
      </div>
      <div className="flex items-baseline gap-1 mt-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        <span className="text-gray-500 text-sm font-medium">{unit}</span>
      </div>
    </div>
  );
};

export default MetricCard;
