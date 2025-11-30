import React from 'react';
import { Clock, Banknote } from 'lucide-react';

const RecentActivity = ({ sales }) => {
  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold text-charcoal mb-6">Recent Sales</h3>
      
      <div className="space-y-4">
        {sales.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No recent sales</p>
        ) : (
          sales.map((sale) => (
            <div 
              key={sale.id} 
              className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal">
                    {sale.receipt_number}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(sale.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-orange-700">
                  ₱{parseFloat(sale.total_amount).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {sale.payment_type}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;