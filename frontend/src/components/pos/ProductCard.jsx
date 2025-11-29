import React from 'react';
import { Plus } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  // Create a simple SVG placeholder
  const placeholderSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%239ca3af'%3E${encodeURIComponent(product.name)}%3C/text%3E%3C/svg%3E`;

  const imageSrc = product.image_path 
    ? `http://localhost:8000/storage/${product.image_path}`
    : placeholderSVG;

  return (
    <div className="card overflow-hidden group cursor-pointer">
      <div className="relative h-40 overflow-hidden bg-gray-100">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            // If image fails to load, show a colored placeholder
            e.target.src = placeholderSVG;
          }}
        />
        {product.stock <= product.low_stock_threshold && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Low Stock
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-charcoal mb-1 truncate">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{product.category}</p>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-orange-800 ">₱{parseFloat(product.price).toFixed(2)}</p>
            <p className="text-xs text-gray-400">Stock: {product.stock}</p>
          </div>
          
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className={`p-2 rounded-lg transition-all duration-200 ${
              product.stock === 0
                ? 'bg-gray-200 cursor-not-allowed'
                : 'bg-orange-900 hover:bg-orange-700 text-white shadow-md hover:shadow-lg active:scale-95'
            }`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;