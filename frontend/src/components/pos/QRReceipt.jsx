import React from 'react';
import { X, Download, Printer } from 'lucide-react';

const QRReceipt = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;

  const qrImageUrl = sale.qr_code_path 
    ? `http://localhost:8000/storage/${sale.qr_code_path}`
    : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-charcoal">Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-6">
          {/* Success Message */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">Payment Successful!</h3>
            <p className="text-gray-500">Transaction completed</p>
          </div>

          {/* Receipt Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Receipt No.</span>
              <span className="font-semibold">{sale.receipt_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-semibold">
                {new Date(sale.created_at).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cashier</span>
              <span className="font-semibold">{sale.user?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment</span>
              <span className="font-semibold capitalize">{sale.payment_type}</span>
            </div>
            {sale.payment_type === 'cash' && sale.payment_received && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Received</span>
                  <span className="font-semibold">₱{parseFloat(sale.payment_received).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Change</span>
                  <span className="font-semibold">₱{parseFloat(sale.change_amount || 0).toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600 font-semibold">Total</span>
              <span className="font-bold text-lg text-orange-900">
                ₱{parseFloat(sale.total_amount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h4 className="font-semibold text-charcoal mb-3">Items Purchased</h4>
            <div className="space-y-2">
              {sale.items?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm bg-gray-50 p-3 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-charcoal">{item.product_name}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x ₱{parseFloat(item.unit_price).toFixed(2)}
                    </p>
                  </div>
                  <span className="font-semibold text-charcoal">
                    ₱{parseFloat(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code */}
          {qrImageUrl ? (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3 font-medium">Scan for Digital Receipt</p>
              <div className="bg-white p-4 rounded-xl shadow-md inline-block border-2 border-gray-100">
                <img 
                  src={qrImageUrl} 
                  alt="QR Receipt" 
                  className="w-48 h-48 mx-auto"
                  onError={(e) => {
                    console.error('QR Code failed to load:', qrImageUrl);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div style={{ display: 'none' }} className="w-48 h-48 flex items-center justify-center text-gray-400 text-sm">
                  QR Code not available
                </div>
              </div>
              {sale.receipt_url && (
                <p className="text-xs text-gray-400 mt-2">
                  {sale.receipt_url}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl flex items-center justify-center">
                <p className="text-gray-400 text-sm">QR Code not generated</p>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₱{parseFloat(sale.subtotal).toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount</span>
                  <span className="font-semibold">-₱{parseFloat(sale.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-semibold">₱{parseFloat(sale.tax).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex space-x-3 sticky bottom-0 bg-white">
          <button
            onClick={handlePrint}
            className="btn-secondary flex-1 flex items-center justify-center space-x-2"
            type="button"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={onClose}
            className="btn-primary flex-1"
            type="button"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRReceipt;