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
    <div className="h-screen w-64 bg-gradient-to-b from-amber-50 to-orange-50 shadow-2xl fixed left-0 top-0 flex flex-col border-r-2 border-amber-200/50">
      {/* Logo */}
      <div className="p-6 border-b border-amber-200/50 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3 group">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Coffee className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
             ButterBean Cafe
            </h1>
            <p className="text-xs text-gray-600">POS System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 bg-gradient-to-r from-amber-100/50 to-orange-100/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-charcoal">{user?.name}</p>
            <p className="text-xs text-amber-700 capitalize font-medium">{user?.role}</p>
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
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg scale-105'
                  : 'text-gray-700 hover:bg-white/80 hover:shadow-md hover:scale-102'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${
                isActive(item.path) ? '' : 'group-hover:scale-110'
              }`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-amber-200/50 bg-white/50 backdrop-blur-sm">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 rounded-xl w-full text-red-600 hover:bg-red-50 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Decorative bottom */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-orange-100/30 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default Sidebar;