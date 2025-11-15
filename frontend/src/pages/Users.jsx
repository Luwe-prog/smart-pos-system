import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserCheck, UserX, X } from 'lucide-react';
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
      // Mock data if API fails
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
      password: '', // Don't show existing password
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
        // Update existing user
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // Don't send empty password
        }
        await usersAPI.update(editingUser.id, updateData);
        alert('User updated successfully!');
      } else {
        // Create new user
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">User Management</h1>
          <p className="text-gray-500 mt-1">Manage staff accounts and permissions</p>
        </div>
        <button 
          onClick={handleAddUser}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-charcoal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
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
                        className="p-2 text-primary hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-2">Total Users</p>
          <p className="text-3xl font-bold text-primary">{users.length}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-2">Admins</p>
          <p className="text-3xl font-bold text-purple-600">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-2">Cashiers</p>
          <p className="text-3xl font-bold text-blue-600">
            {users.filter(u => u.role === 'cashier').length}
          </p>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-charcoal">
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
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  className="w-5 h-5 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-charcoal">
                  Active Account
                </label>
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
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;