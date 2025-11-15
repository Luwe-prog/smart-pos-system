import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, AlertTriangle, X, Upload } from 'lucide-react';
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
        await productsAPI.delete(productId);
        alert('Product deleted successfully!');
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
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
      
      // Create preview
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
    if (editingProduct) {
      // UPDATE - Use POST with _method for FormData
      const submitData = new FormData();
      submitData.append('_method', 'PUT');
      submitData.append('name', formData.name);
      submitData.append('category', formData.category);
      submitData.append('price', formData.price);
      submitData.append('stock', formData.stock);
      submitData.append('low_stock_threshold', formData.low_stock_threshold);
      submitData.append('description', formData.description);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      // Use POST instead of PUT for FormData
      const response = await fetch(`http://localhost:8000/api/products/${editingProduct.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: submitData,
      });

      if (!response.ok) {
        throw new Error('Update failed');
      }

      alert('Product updated successfully!');
    } else {
      // CREATE - Normal FormData
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Manage your products and stock levels</p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex items-center space-x-4">
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
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-charcoal hover:bg-gray-200'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span>Low Stock Only</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
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
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {product.image_path ? (
                            <img
                              src={`http://localhost:8000/storage/${product.image_path}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                               e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Crect fill="%23e5e7eb" width="48" height="48"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
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
                      <span className="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm font-medium">
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
                          className="p-2 text-primary hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-2">Total Products</p>
          <p className="text-3xl font-bold text-primary">{products.length}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-2">Low Stock Items</p>
          <p className="text-3xl font-bold text-red-600">
            {products.filter(p => p.stock <= p.low_stock_threshold).length}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-2">Total Stock Value</p>
          <p className="text-3xl font-bold text-green-600">
            ₱{products.reduce((sum, p) => sum + (parseFloat(p.price) * p.stock), 0).toFixed(2)}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-2">Categories</p>
          <p className="text-3xl font-bold text-purple-600">
            {new Set(products.map(p => p.category)).size}
          </p>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-charcoal">
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
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="3.50"
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
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
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

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;