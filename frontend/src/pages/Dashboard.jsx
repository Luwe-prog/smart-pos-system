import React, { useState, useEffect } from 'react';
import { Banknote, ShoppingBag, TrendingUp, Package } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import SalesChart from '../components/dashboard/SalesChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { dashboardAPI } from '../services/api';

const Dashboard = () => {
  const [period, setPeriod] = useState('daily');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getAnalytics(period);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!analytics) return <div>Error loading data</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your café performance</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-1">
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200 ${
                period === p
                  ? 'bg-primary text-white shadow-md'
                  : 'text-charcoal hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Sales"
          value={`₱${analytics.stats.total_sales.toLocaleString()}`}
          icon={Banknote}
          trend={analytics.stats.growth_percentage}
          color="primary"
        />
        <StatsCard
          title="Orders"
          value={analytics.stats.total_orders.toLocaleString()}
          icon={ShoppingBag}
          color="accent"
        />
        <StatsCard
          title="Avg Order Value"
          value={`₱${analytics.stats.average_order_value.toFixed(2)}`}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Low Stock Items"
          value={analytics.low_stock_products.length}
          icon={Package}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart
          data={analytics.sales_trend}
          type="line"
          title="Sales Trend"
        />
        <SalesChart
          data={analytics.sales_trend}
          type="bar"
          title="Order Volume"
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <RecentActivity sales={analytics.recent_sales} />

        {/* Top Products */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-charcoal mb-6">Top Selling Products</h3>
          <div className="space-y-4">
            {analytics.top_products.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    ₱{parseFloat(product.total_revenue).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.total_sold} sold
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {analytics.low_stock_products.length > 0 && (
        <div className="card p-6 border-l-4 border-red-500">
          <h3 className="text-xl font-bold text-charcoal mb-4">⚠️ Low Stock Alert</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.low_stock_products.map((product) => (
              <div key={product.id} className="bg-red-50 p-4 rounded-lg">
                <p className="font-semibold text-charcoal">{product.name}</p>
                <p className="text-sm text-gray-600">{product.category}</p>
                <p className="text-lg font-bold text-red-600 mt-2">
                  {product.stock} units left
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;