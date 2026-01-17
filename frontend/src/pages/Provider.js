import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Briefcase, Star, TrendingUp, Plus } from 'lucide-react';
import { API, useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

export const ProviderDashboard = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await axios.get(`${API}/provider/earnings`);
      setEarnings(response.data);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.provider_status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-12 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="text-yellow-400" size={32} />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-4">Pending Approval</h2>
          <p className="text-slate-400">Your account is under review by our admin team. You'll be able to accept jobs once approved.</p>
        </div>
      </div>
    );
  }

  if (user?.provider_status === 'rejected' || user?.provider_status === 'blocked') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-12 max-w-md text-center">
          <h2 className="text-2xl font-heading font-bold mb-4 text-red-400">Account Inactive</h2>
          <p className="text-slate-400">Your provider account is not active. Please contact support for more information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold gradient-text mb-8">Provider Dashboard</h1>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold gradient-text">₹{earnings?.total_earnings || 0}</p>
            <p className="text-slate-400 text-sm">Total Earnings</p>
          </div>

          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center mb-4">
              <Briefcase className="text-white" size={24} />
            </div>
            <p className="text-3xl font-bold gradient-text">{earnings?.completed_jobs || 0}</p>
            <p className="text-slate-400 text-sm">Completed Jobs</p>
          </div>

          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center mb-4">
              <Star className="text-white" size={24} />
            </div>
            <p className="text-3xl font-bold gradient-text">{earnings?.rating?.toFixed(1) || 0}</p>
            <p className="text-slate-400 text-sm">Average Rating</p>
          </div>

          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center mb-4">
              <Star className="text-white" size={24} />
            </div>
            <p className="text-3xl font-bold gradient-text">{earnings?.total_reviews || 0}</p>
            <p className="text-slate-400 text-sm">Total Reviews</p>
          </div>
        </div>

        <div className="glass-card p-8 text-center">
          <h2 className="text-2xl font-heading font-bold mb-4">Welcome to Your Dashboard</h2>
          <p className="text-slate-400 mb-6">Manage your services and respond to booking requests</p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => window.location.href = '/provider/services'} data-testid="manage-services-btn" className="btn-primary">
              Manage Services
            </Button>
            <Button onClick={() => window.location.href = '/provider/bookings'} data-testid="view-requests-btn" className="btn-secondary">
              View Requests
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProviderServices = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price: 0,
    duration_minutes: 60,
    location: 'Vijayawada'
  });

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services/provider/me`);
      setServices(response.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/services`, formData);
      toast.success('Service created successfully!');
      setCreateOpen(false);
      fetchServices();
      setFormData({ title: '', description: '', category_id: '', price: 0, duration_minutes: 60, location: 'Vijayawada' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create service');
    }
  };

  return (
    <div className="min-h-screen py-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-heading font-bold gradient-text">My Services</h1>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-service-btn" className="btn-primary">
                <Plus className="mr-2" size={20} /> Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Service</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-4">
                <div>
                  <label className="text-slate-300 text-sm mb-2 block">Service Title</label>
                  <Input
                    data-testid="service-title-input"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm mb-2 block">Description</label>
                  <Textarea
                    data-testid="service-description-input"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm mb-2 block">Category</label>
                  <select
                    data-testid="service-category-select"
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Price (₹)</label>
                    <Input
                      type="number"
                      data-testid="service-price-input"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="bg-slate-950 border-slate-800 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Duration (minutes)</label>
                    <Input
                      type="number"
                      data-testid="service-duration-input"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                      className="bg-slate-950 border-slate-800 text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-300 text-sm mb-2 block">Location</label>
                  <Input
                    data-testid="service-location-input"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>
                <Button type="submit" data-testid="create-service-btn" className="w-full btn-primary">
                  Create Service
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {services.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-slate-400 text-lg">No services yet. Create your first service!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} data-testid={`service-${service.id}`} className="glass-card p-6">
                <h3 className="font-heading font-bold text-lg mb-2">{service.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-300">Category: {service.category_name}</p>
                  <p className="text-violet-400 font-medium">₹{service.price}</p>
                  <p className="text-slate-400">{service.duration_minutes} mins</p>
                  {service.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span>{service.rating.toFixed(1)} ({service.reviews_count} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings/provider/me`);
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      await axios.patch(`${API}/bookings/${bookingId}/status`, { status });
      toast.success('Status updated successfully!');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen py-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold gradient-text mb-8">Booking Requests</h1>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-slate-400 text-lg">No booking requests yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} data-testid={`booking-${booking.id}`} className="glass-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-heading font-bold mb-1">{booking.service_title}</h3>
                    <p className="text-slate-400 text-sm">Customer: {booking.customer_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    booking.status === 'accepted' ? 'bg-blue-500/20 text-blue-400' :
                    booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {booking.status}
                  </span>
                </div>

                <p className="text-slate-300 text-sm mb-4">
                  Scheduled: {new Date(booking.scheduled_date).toLocaleString()}
                </p>
                {booking.notes && <p className="text-slate-400 text-sm mb-4">Notes: {booking.notes}</p>}

                {booking.status === 'pending' && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => updateStatus(booking.id, 'accepted')}
                      data-testid={`accept-${booking.id}`}
                      className="btn-primary flex-1"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => updateStatus(booking.id, 'rejected')}
                      data-testid={`reject-${booking.id}`}
                      className="btn-secondary flex-1"
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {booking.status === 'accepted' && (
                  <Button
                    onClick={() => updateStatus(booking.id, 'completed')}
                    data-testid={`complete-${booking.id}`}
                    className="btn-primary w-full"
                  >
                    Mark as Completed
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
