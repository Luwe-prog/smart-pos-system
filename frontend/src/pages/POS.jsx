import React, { useState, useEffect } from 'react';
import { Search, Grid, List } from 'lucide-react';
import ProductCard from '../components/pos/ProductCard';
import Cart from '../components/pos/Cart';
import PaymentModal from '../components/pos/PaymentModal';
import QRReceipt from '../components/pos/QRReceipt';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { productsAPI, salesAPI } from '../services/api';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [cartSummary, setCartSummary] = useState(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [selectedCategory, searchQuery]);

  const loadProducts = async () => {
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      
      const response = await productsAPI.getAll(params);
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

const loadCategories = async () => {
  try {
    const response = await productsAPI.getCategories();
    setCategories(['all', ...response.data]);
  } catch (error) {
    console.error('Error loading categories:', error);
    // Fallback to default categories if API fails
    setCategories(['all', 'Coffee', 'Pastry', 'Tea']);
  }
};

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCartItems(cartItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      handleRemoveItem(productId);
    } else {
      setCartItems(cartItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const handleRemoveItem = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const handleCheckout = (summary) => {
    setCartSummary(summary);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async (paymentData) => {
    try {
      const saleData = {
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        payment_type: paymentData.payment_type,
        payment_received: paymentData.payment_received,
        discount: 0,
      };

      const response = await salesAPI.create(saleData);
      setCurrentSale(response.data.sale);
      setCartItems([]);
      setShowPaymentModal(false);
      setShowReceiptModal(true);
      
      // Reload products to update stock
      loadProducts();
    } catch (error) {
      console.error('Error processing sale:', error);
      alert(error.response?.data?.message || 'Error processing sale');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Products Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="bg-white border-b border-gray-100 p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-12 w-full"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-charcoal hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All Products' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white border-l border-gray-100">
        <Cart
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
        />
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cartSummary={cartSummary}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Receipt Modal */}
      <QRReceipt
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        sale={currentSale}
      />
    </div>
  );
};

export default POS;