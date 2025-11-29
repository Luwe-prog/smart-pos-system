import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserCheck, UserX, X, Users as UsersIcon, Coffee } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { usersAPI } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier',
    is_active: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([
        { id: 1, name: 'Admin User', email: 'admin@cafe.com', role: 'admin', is_active: true },
        { id: 2, name: 'John Cashier', email: 'cashier@cafe.com', role: 'cashier', is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'cashier',
      is_active: true
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      is_active: user.is_active
    });
    setShowModal(true);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        await usersAPI.delete(userId);
        alert('User deleted successfully!');
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. This might be a demo account.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await usersAPI.update(editingUser.id, updateData);
        alert('User updated successfully!');
      } else {
        await usersAPI.create(formData);
        alert('User created successfully!');
      }
      
      setShowModal(false);
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.message || 'Error saving user');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
            User Management
          </h1>
          <p className="text-gray-600 mt-1 flex items-center">
            <UsersIcon className="w-4 h-4 mr-2 text-amber-600" />
            Manage staff accounts and permissions
          </p>
        </div>
        <button 
          onClick={handleAddUser}
          className="btn-primary flex items-center space-x-2 animate-fade-in-down"
          style={{ animationDelay: '0.1s' }}
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden relative z-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-charcoal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr 
                  key={user.id} 
                  className="hover:bg-amber-50/50 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold text-charcoal">{user.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-600">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {user.is_active ? (
                        <>
                          <UserCheck className="w-5 h-5 text-green-500" />
                          <span className="text-green-600 font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-5 h-5 text-red-500" />
                          <span className="text-red-600 font-medium">Inactive</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit user"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="card p-6 border-l-4 border-amber-500 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-gray-500 mb-2">Total Users</p>
          <p className="text-3xl font-bold text-amber-700">{users.length}</p>
        </div>
        <div className="card p-6 border-l-4 border-purple-500 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm text-gray-500 mb-2">Admins</p>
          <p className="text-3xl font-bold text-purple-600">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
        <div className="card p-6 border-l-4 border-blue-500 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <p className="text-sm text-gray-500 mb-2">Cashiers</p>
          <p className="text-3xl font-bold text-blue-600">
            {users.filter(u => u.role === 'cashier').length}
          </p>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slide-up">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
              <h2 className="text-2xl font-bold text-charcoal flex items-center">
                <Coffee className="w-6 h-6 mr-2 text-amber-600" />
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="john@cafe.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="••••••••"
                  required={!editingUser}
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="cashier">Cashier</option>
                  <option value="admin">Admin</option>
                  </select>
              </div>
               {/* Active Status */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
            />
            <label htmlFor="is_active" className="text-sm font-semibold text-charcoal">
              Active Account
            </label>
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
            {editingUser ? 'Update User' : 'Create User'}
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
export default Users;