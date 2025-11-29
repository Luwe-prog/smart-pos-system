import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, AlertTriangle, X, Upload, Package, Coffee } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { productsAPI } from '../services/api';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    low_stock_threshold: '10',
    description: '',
    image: null
  });

  useEffect(() => {
    loadProducts();
  }, [searchQuery, showLowStock]);

  const loadProducts = async () => {
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (showLowStock) params.low_stock = true;
      
      const response = await productsAPI.getAll(params);
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setImagePreview(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      low_stock_threshold: '10',
      description: '',
      image: null
    });
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      low_stock_threshold: product.low_stock_threshold,
      description: product.description || '',
      image: null
    });
    
    if (product.image_path) {
      setImagePreview(`http://localhost:8000/storage/${product.image_path}`);
    } else {
      setImagePreview(null);
    }
    
    setShowModal(true);
  };

const handleDeleteProduct = async (productId, productName) => {
  if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
    try {
      const response = await productsAPI.delete(productId);
      
      // Check if it was deactivated vs deleted
      if (response.data.deactivated) {
        alert('⚠️ ' + response.data.message);
      } else {
        alert('✓ Product deleted successfully!');
      }
      
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMsg = error.response?.data?.message || 'Error deleting product';
      alert('❌ ' + errorMsg);
    }
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('category', formData.category);
      submitData.append('price', formData.price);
      submitData.append('stock', formData.stock);
      submitData.append('low_stock_threshold', formData.low_stock_threshold);
      submitData.append('description', formData.description);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (editingProduct) {
        submitData.append('_method', 'PUT');
        
        const token = localStorage.getItem('auth_token');
        const response = await fetch(
          `http://localhost:8000/api/products/${editingProduct.id}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
            body: submitData,
          }
        );

        if (!response.ok) throw new Error('Update failed');
        alert('Product updated successfully!');
      } else {
        await productsAPI.create(submitData);
        alert('Product created successfully!');
      }
      
      setShowModal(false);
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.message || 'Error saving product');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="p-6 space-y-6 relative min-h-screen">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-amber-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between relative z-10 animate-fade-in-down">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-1 flex items-center">
            <Package className="w-4 h-4 mr-2 text-amber-600" />
            Manage your products and stock levels
          </p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="btn-primary flex items-center space-x-2 animate-fade-in-down"
          style={{ animationDelay: '0.1s' }}
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex items-center space-x-4 relative z-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="input-field pl-11 w-full"
          />
        </div>
        <button
          onClick={() => setShowLowStock(!showLowStock)}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
            showLowStock
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
              : 'bg-white text-charcoal hover:bg-gray-50 shadow-sm border border-gray-200'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span>Low Stock Only</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden relative z-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-charcoal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>No products found</p>
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr 
                    key={product.id} 
                    className="hover:bg-amber-50/50 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg overflow-hidden flex-shrink-0 border-2 border-amber-200">
                          {product.image_path ? (
                            <img
                              src={`http://localhost:8000/storage/${product.image_path}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Coffee className="w-6 h-6 text-amber-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-charcoal">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-charcoal">₱{parseFloat(product.price).toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${
                          product.stock <= product.low_stock_threshold
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}>
                          {product.stock}
                        </span>
                        {product.stock <= product.low_stock_threshold && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
        <div className="card p-6 border-l-4 border-amber-500 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm text-gray-500 mb-2">Total Products</p>
          <p className="text-3xl font-bold text-amber-700">{products.length}</p>
        </div>
        <div className="card p-6 border-l-4 border-red-500 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <p className="text-sm text-gray-500 mb-2">Low Stock Items</p>
          <p className="text-3xl font-bold text-red-600">
            {products.filter(p => p.stock <= p.low_stock_threshold).length}
          </p>
        </div>
        <div className="card p-6 border-l-4 border-green-500 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <p className="text-sm text-gray-500 mb-2">Total Stock Value</p>
          <p className="text-3xl font-bold text-green-600">
            ₱{products.reduce((sum, p) => sum + (parseFloat(p.price) * p.stock), 0).toFixed(2)}
          </p>
        </div>
        <div className="card p-6 border-l-4 border-purple-500 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <p className="text-sm text-gray-500 mb-2">Categories</p>
          <p className="text-3xl font-bold text-purple-600">
            {new Set(products.map(p => p.category)).size}
          </p>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl my-8 animate-slide-up">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
              <h2 className="text-2xl font-bold text-charcoal flex items-center">
                <Coffee className="w-6 h-6 mr-2 text-amber-600" />
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Espresso"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Coffee"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Price (₱) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="150.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="100"
                    min="0"
                    required
                  />
                </div>

                {/* Low Stock Threshold */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    name="low_stock_threshold"
                    value={formData.low_stock_threshold}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="10"
                    min="0"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Product Image
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="btn-secondary cursor-pointer flex items-center space-x-2 flex-1">
                      <Upload className="w-4 h-4" />
                      <span>Choose Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Preview
                  </label>
                  <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg overflow-hidden border-2 border-amber-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field resize-none"
                  placeholder="Product description..."
                  rows="3"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex space-x-3 bg-gradient-to-r from-amber-50 to-orange-50">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary flex-1"
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Inventory;