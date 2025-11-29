import React, { useState, useEffect } from 'react';
import { Banknote, ShoppingBag, TrendingUp, Package, Coffee } from 'lucide-react';
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
    <div className="p-6 space-y-6 relative min-h-screen">
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-amber-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-yellow-200 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between relative z-10 animate-fade-in-down">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1 flex items-center">
            <Coffee className="w-4 h-4 mr-2 text-amber-600" />
            Overview of your café performance
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-1 border border-amber-200/50">
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200 ${
                period === p
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                  : 'text-charcoal hover:bg-amber-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <StatsCard
            title="Total Sales"
            value={`₱${analytics.stats.total_sales.toLocaleString()}`}
            icon={Banknote}
            trend={analytics.stats.growth_percentage}
            color="primary"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <StatsCard
            title="Orders"
            value={analytics.stats.total_orders.toLocaleString()}
            icon={ShoppingBag}
            color="accent"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <StatsCard
            title="Avg Order Value"
            value={`₱${analytics.stats.average_order_value.toFixed(2)}`}
            icon={TrendingUp}
            color="green"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <StatsCard
            title="Low Stock Items"
            value={analytics.low_stock_products.length}
            icon={Package}
            color="purple"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        {/* Recent Sales */}
        <RecentActivity sales={analytics.recent_sales} />

        {/* Top Products */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-charcoal mb-6 flex items-center">
            <Coffee className="w-5 h-5 mr-2 text-amber-600" />
            Top Selling Products
          </h3>
          <div className="space-y-4">
            {analytics.top_products.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-700">
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
        <div className="card p-6 border-l-4 border-red-500 relative z-10 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <h3 className="text-xl font-bold text-charcoal mb-4">⚠️ Low Stock Alert</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.low_stock_products.map((product) => (
              <div key={product.id} className="bg-red-50 p-4 rounded-lg border border-red-200 hover:shadow-md transition-shadow duration-200">
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