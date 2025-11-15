import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary text-white',
    accent: 'bg-accent text-white',
    green: 'bg-green-500 text-white',
    purple: 'bg-purple-500 text-white',
  };

  const isPositive = trend >= 0;

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-charcoal">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center space-x-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-semibold ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            {isPositive ? '+' : ''}{trend.toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;