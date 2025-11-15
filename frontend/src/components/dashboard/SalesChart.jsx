import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SalesChart = ({ data, type = 'line', title }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData = data.map(item => ({
    period: formatDate(item.period),
    sales: parseFloat(item.total),
    orders: item.orders,
  }));

  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold text-charcoal mb-6">{title}</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period" 
              stroke="#999"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#999"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '10px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#007AFF" 
              strokeWidth={3}
              dot={{ fill: '#007AFF', r: 4 }}
              activeDot={{ r: 6 }}
              name="Sales ($)"
            />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period" 
              stroke="#999"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#999"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '10px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="sales" 
              fill="#007AFF" 
              radius={[8, 8, 0, 0]}
              name="Sales ($)"
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;