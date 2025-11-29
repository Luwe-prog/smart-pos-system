import React, { useState } from 'react';
import { X, CreditCard, Banknote } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, cartSummary, onConfirmPayment }) => {
  const [paymentType, setPaymentType] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const change = paymentType === 'cash' 
    ? Math.max(0, parseFloat(amountReceived || 0) - cartSummary.total)
    : 0;

  const canProceed = paymentType === 'card' || 
    (paymentType === 'cash' && parseFloat(amountReceived) >= cartSummary.total);

  const handlePayment = async () => {
    setLoading(true);
    try {
      await onConfirmPayment({
        payment_type: paymentType,
        payment_received: paymentType === 'cash' ? parseFloat(amountReceived) : cartSummary.total,
      });
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-charcoal">Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Total Amount */}
          <div className="bg-orange-900 bg-opacity-10 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Total Amount</p>
            <p className="text-4xl font-bold text-orange-900">
              ₱{cartSummary.total.toFixed(2)}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentType('cash')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  paymentType === 'cash'
                    ? 'border-orange-800 bg-orange-700 bg-opacity-10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Banknote className={`w-8 h-8 mx-auto mb-2 ${
                  paymentType === 'cash' ? 'text-orange-900' : 'text-gray-400'
                }`} />
                <p className="font-semibold text-sm">Cash</p>
              </button>
              <button
                onClick={() => setPaymentType('card')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  paymentType === 'card'
                    ? 'border-orange-900 bg-orange-700 bg-opacity-10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className={`w-8 h-8 mx-auto mb-2 ${
                  paymentType === 'card' ? 'text-orange-900' : 'text-gray-400'
                }`} />
                <p className="font-semibold text-sm">Card</p>
              </button>
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentType === 'cash' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Amount Received
                </label>
                <input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder="0.00"
                  className="input-field text-lg"
                  step="0.01"
                  min={cartSummary.total}
                />
              </div>

              {amountReceived && parseFloat(amountReceived) >= cartSummary.total && (
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Change</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₱{change.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Amount Buttons for Cash */}
          {paymentType === 'cash' && (
            <div className="grid grid-cols-4 gap-2">
              {[100, 200, 500, 1000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setAmountReceived(amount.toString())}
                  className="btn-secondary py-2 text-sm"
                >
                  ₱{amount}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={!canProceed || loading}
            className="btn-primary flex-1 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;