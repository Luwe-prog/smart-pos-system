import React, { useState, useEffect } from 'react';
import { Download, Calendar, Banknote, TrendingUp, FileText } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { dashboardAPI } from '../services/api';
import jsPDF from 'jspdf';

const Reports = () => {
  const [period, setPeriod] = useState('monthly');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

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

 const exportToPDF = () => {
  try {
    setExporting(true);
    console.log('Starting PDF export...');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 122, 255);
    doc.text('Sales Report', pageWidth / 2, y, { align: 'center' });
    y += 12;
    
    // Date and Period
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: 'center' });
    y += 6;
    doc.text(`Period: ${period.toUpperCase()}`, pageWidth / 2, y, { align: 'center' });
    y += 15;
    
    // Summary Box
    doc.setFillColor(249, 249, 252);
    doc.rect(14, y, pageWidth - 28, 40, 'F');
    y += 10;
    
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    doc.text('Summary', 20, y);
    y += 10;
    
    // Total Revenue
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Total Revenue:', 25, y);
    doc.setTextColor(0, 122, 255);
    doc.setFontSize(12);
    doc.text(`PHP ${analytics.stats.total_sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 75, y);
    y += 8;
    
    // Total Orders
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Total Orders:', 25, y);
    doc.setTextColor(0, 122, 255);
    doc.setFontSize(12);
    doc.text(`${analytics.stats.total_orders}`, 75, y);
    y += 8;
    
    // Average Order
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Average Order:', 25, y);
    doc.setTextColor(0, 122, 255);
    doc.setFontSize(12);
    doc.text(`PHP ${analytics.stats.average_order_value.toFixed(2)}`, 75, y);
    y += 8;
    
    // Growth
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Growth:', 25, y);
    const isPositive = analytics.stats.growth_percentage >= 0;
    doc.setTextColor(isPositive ? 0 : 255, isPositive ? 200 : 0, 0);
    doc.setFontSize(12);
    doc.text(`${isPositive ? '+' : ''}${analytics.stats.growth_percentage.toFixed(1)}%`, 75, y);
    y += 20;
    
    // Top Products
    doc.setFontSize(16);
    doc.setTextColor(51, 51, 51);
    doc.text('Top Selling Products', 20, y);
    y += 10;
    
    // Table Header
    doc.setFillColor(0, 122, 255);
    doc.rect(14, y - 5, pageWidth - 28, 10, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('#', 18, y);
    doc.text('Product', 30, y);
    doc.text('Category', 100, y);
    doc.text('Sold', 140, y);
    doc.text('Revenue', 165, y);
    y += 10;
    
    // Table Rows
    doc.setFontSize(9);
    analytics.top_products.forEach((product, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(249, 249, 252);
        doc.rect(14, y - 5, pageWidth - 28, 8, 'F');
      }
      
      doc.setTextColor(51, 51, 51);
      doc.text(`${index + 1}`, 18, y);
      doc.text(product.name.substring(0, 35), 30, y);
      doc.text(product.category, 100, y);
      doc.text(`${product.total_sold}`, 140, y);
      doc.setTextColor(0, 150, 0);
      doc.text(`PHP ${parseFloat(product.total_revenue).toFixed(2)}`, 165, y);
      
      y += 8;
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.text(
        `Page ${i} of ${pageCount} | Smart POS - Cafe Management System`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
    
    // Save
    const fileName = `sales-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('PDF exported successfully');
    alert('✅ Report exported successfully!');
    
  } catch (error) {
    console.error('PDF Export Error Details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    alert(`❌ Export failed: ${error.message}`);
  } finally {
    setExporting(false);
  }
};

  const exportToCSV = () => {
  try {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "Sales Report\n";
    csvContent += `Period: ${period}\n`;
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    csvContent += "Summary\n";
    csvContent += `Total Revenue,PHP ${analytics.stats.total_sales.toLocaleString()}\n`;
    csvContent += `Total Orders,${analytics.stats.total_orders}\n`;
    csvContent += `Average Order,PHP ${analytics.stats.average_order_value.toFixed(2)}\n`;
    csvContent += `Growth,${analytics.stats.growth_percentage.toFixed(1)}%\n\n`;
    
    csvContent += "Top Products\n";
    csvContent += "Rank,Product,Category,Units Sold,Revenue\n";
    analytics.top_products.forEach((product, index) => {
      csvContent += `${index + 1},${product.name},${product.category},${product.total_sold},PHP ${parseFloat(product.total_revenue).toFixed(2)}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales-report-${period}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('✅ CSV exported successfully!');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    alert('❌ Error exporting CSV');
  }
};

  if (loading) return <LoadingSpinner fullScreen />;
  if (!analytics) return <div>Error loading data</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Sales Reports</h1>
          <p className="text-gray-500 mt-1">Detailed analytics and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input-field"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button 
            onClick={exportToCSV}
            className="btn-secondary flex items-center space-x-2"
          >
            <FileText className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={exportToPDF}
            disabled={exporting}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            <span>{exporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-l-4 border-primary">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <Banknote className="w-8 h-8 text-primary" />
          </div>
          <p className="text-3xl font-bold text-charcoal mb-2">
           ₱{analytics.stats.total_sales.toLocaleString()}
          </p>
          <p className="text-sm text-green-600 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            +{analytics.stats.growth_percentage.toFixed(1)}% vs last period
          </p>
        </div>

        <div className="card p-6 border-l-4 border-accent">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Total Orders</p>
            <Calendar className="w-8 h-8 text-accent" />
          </div>
          <p className="text-3xl font-bold text-charcoal mb-2">
            {analytics.stats.total_orders}
          </p>
          <p className="text-sm text-gray-500">
            Avg: ₱{analytics.stats.average_order_value.toFixed(2)}
          </p>
        </div>

        <div className="card p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Period</p>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-charcoal mb-2 capitalize">
            {period}
          </p>
          <p className="text-sm text-gray-500">Report Type</p>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-charcoal mb-6">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-charcoal">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-charcoal">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-charcoal">Category</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-charcoal">Units Sold</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-charcoal">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.top_products.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-400 text-white' :
                      index === 1 ? 'bg-gray-300 text-white' :
                      index === 2 ? 'bg-orange-400 text-white' :
                      'bg-gray-100 text-charcoal'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-charcoal">{product.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-semibold text-charcoal">{product.total_sold}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-green-600">
                      ₱{parseFloat(product.total_revenue).toFixed(2)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;