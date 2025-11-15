import React from 'react';
import { Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';

const Cart = ({ items, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-charcoal">Current Order</h2>
        <p className="text-sm text-gray-500">{items.length} items</p>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500">Cart is empty</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-charcoal">{item.name}</h4>
                  <p className="text-sm text-primary font-bold">₱{item.price}</p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="w-8 h-8 rounded-lg bg-primary hover:bg-primary-dark text-white flex items-center justify-center transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-bold text-charcoal">
                  ₱{(item.price * item.quantity).toFixed(2)} 
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="p-6 border-t border-gray-100 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (10%)</span>
              <span className="font-semibold">₱{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-primary">₱{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => onCheckout({ subtotal, tax, total })}
            className="btn-primary w-full"
          >
            Proceed to Payment
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;