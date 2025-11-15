import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  LogOut,
  Coffee
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'cashier'] },
    { path: '/pos', icon: ShoppingCart, label: 'POS', roles: ['admin', 'cashier'] },
    { path: '/inventory', icon: Package, label: 'Inventory', roles: ['admin'] },
    { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin'] },
    { path: '/users', icon: Users, label: 'Users', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen w-64 bg-white shadow-lg fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="bg-primary p-2 rounded-lg">
            <Coffee className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal">Smart POS</h1>
            <p className="text-xs text-gray-500">Café Management</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 bg-background">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-charcoal">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-primary text-white shadow-md'
                  : 'text-charcoal-lighter hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;