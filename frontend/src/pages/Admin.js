import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Briefcase, DollarSign, TrendingUp, Check, X } from 'lucide-react';
import { API } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold gradient-text mb-8">Admin Dashboard</h1>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold gradient-text">{stats?.total_users || 0}</p>
            <p className="text-slate-400 text-sm">Total Users</p>
          </div>

          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center mb-4">
              <Briefcase className="text-white" size={24} />
            </div>
            <p className="text-3xl font-bold gradient-text">{stats?.total_bookings || 0}</p>
            <p className="text-slate-400 text-sm">Total Bookings</p>
          </div>

          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center mb-4">
              <TrendingUp className="text-white" size={24} />
            </div>
            <p className="text-3xl font-bold gradient-text">{stats?.total_providers || 0}</p>
            <p className="text-slate-400 text-sm">Total Providers</p>
          </div>

          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center mb-4">
              <DollarSign className="text-white" size={24} />
            </div>
            <p className="text-3xl font-bold gradient-text">₹{stats?.total_revenue || 0}</p>
            <p className="text-slate-400 text-sm">Total Revenue</p>
          </div>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-2xl font-heading font-bold mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              onClick={() => window.location.href = '/admin/providers'}
              data-testid="manage-providers-btn"
              className="btn-primary"
            >
              Manage Providers
              {stats?.pending_approvals > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {stats.pending_approvals}
                </span>
              )}
            </Button>
            <Button
              onClick={() => window.location.href = '/admin/users'}
              data-testid="manage-users-btn"
              className="btn-secondary"
            >
              Manage Users
            </Button>
            <Button
              onClick={() => window.location.href = '/admin/categories'}
              data-testid="manage-categories-btn"
              className="btn-secondary"
            >
              Manage Categories
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await axios.get(`${API}/admin/providers`);
      setProviders(response.data);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (userId, status) => {
    try {
      await axios.patch(`${API}/admin/providers/${userId}/status`, null, {
        params: { status }
      });
      toast.success('Provider status updated!');
      fetchProviders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen py-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold gradient-text mb-8">Provider Management</h1>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {providers.map((provider) => (
              <div key={provider.user_id} data-testid={`provider-${provider.user_id}`} className="glass-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-heading font-bold mb-1">{provider.full_name}</h3>
                    <p className="text-slate-400 text-sm">{provider.email}</p>
                    <p className="text-slate-400 text-sm">{provider.phone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    provider.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    provider.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    provider.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {provider.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-slate-400">Category</p>
                    <p className="font-medium">{provider.service_category}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Experience</p>
                    <p className="font-medium">{provider.experience_years} years</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Rating</p>
                    <p className="font-medium">{provider.rating?.toFixed(1) || 'N/A'}</p>
                  </div>
                </div>

                {provider.description && (
                  <p className="text-slate-300 text-sm mb-4">{provider.description}</p>
                )}

                {provider.status === 'pending' && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => updateStatus(provider.user_id, 'approved')}
                      data-testid={`approve-${provider.user_id}`}
                      className="btn-primary flex-1"
                    >
                      <Check className="mr-2" size={18} />
                      Approve
                    </Button>
                    <Button
                      onClick={() => updateStatus(provider.user_id, 'rejected')}
                      data-testid={`reject-${provider.user_id}`}
                      className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 flex-1 rounded-full"
                    >
                      <X className="mr-2" size={18} />
                      Reject
                    </Button>
                  </div>
                )}

                {provider.status === 'approved' && (
                  <Button
                    onClick={() => updateStatus(provider.user_id, 'blocked')}
                    data-testid={`block-${provider.user_id}`}
                    className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 rounded-full"
                  >
                    Block Provider
                  </Button>
                )}

                {provider.status === 'blocked' && (
                  <Button
                    onClick={() => updateStatus(provider.user_id, 'approved')}
                    data-testid={`unblock-${provider.user_id}`}
                    className="btn-primary"
                  >
                    Unblock Provider
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold gradient-text mb-8">User Management</h1>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="glass-card p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 text-slate-400 font-medium">Name</th>
                    <th className="text-left py-3 text-slate-400 font-medium">Email</th>
                    <th className="text-left py-3 text-slate-400 font-medium">Phone</th>
                    <th className="text-left py-3 text-slate-400 font-medium">Role</th>
                    <th className="text-left py-3 text-slate-400 font-medium">Credits</th>
                    <th className="text-left py-3 text-slate-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.email} data-testid={`user-${user.email}`} className="border-b border-slate-800/50">
                      <td className="py-3">{user.full_name}</td>
                      <td className="py-3 text-slate-400">{user.email}</td>
                      <td className="py-3 text-slate-400">{user.phone}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-violet-500/20 text-violet-400' :
                          user.role === 'provider' ? 'bg-cyan-500/20 text-cyan-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3">{user.credits || 0}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
