import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Star, Clock, MapPin, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

export const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const params = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      const response = await axios.get(`${API}/services`, { params });
      setServices(response.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold gradient-text mb-4">Browse Services</h1>
          <p className="text-slate-400">Find the perfect service provider for your needs</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-500" size={20} />
              <input
                type="text"
                data-testid="service-search-input"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div>
            <select
              data-testid="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-violet-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-slate-400 text-lg">No services found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ServiceCard = ({ service, user }) => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to book services');
      navigate('/login');
      return;
    }

    if (user.role !== 'customer') {
      toast.error('Only customers can book services');
      return;
    }

    if (!scheduledDate) {
      toast.error('Please select a date and time');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/bookings`, {
        service_id: service.id,
        scheduled_date: scheduledDate,
        notes: notes
      });
      toast.success('Booking created successfully!');
      setBookingOpen(false);
      navigate('/customer/bookings');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid={`service-card-${service.id}`} className="glass-card p-6 hover:neon-glow transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-heading font-bold text-lg mb-1">{service.title}</h3>
          <p className="text-sm text-slate-400">{service.category_name}</p>
        </div>
        {service.rating > 0 && (
          <div className="flex items-center gap-1 bg-violet-500/20 px-2 py-1 rounded-full">
            <Star size={14} className="text-violet-400 fill-violet-400" />
            <span className="text-sm font-medium">{service.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      <p className="text-slate-300 text-sm mb-4 line-clamp-2">{service.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock size={16} />
          <span>{service.duration_minutes} mins</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <MapPin size={16} />
          <span>{service.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-violet-400">
          <IndianRupee size={16} />
          <span>{service.price}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 mb-3">By {service.provider_name}</p>
        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogTrigger asChild>
            <Button data-testid={`book-service-btn-${service.id}`} className="w-full btn-primary">
              Book Now
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">Book Service</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-slate-300 text-sm mb-2 block">Scheduled Date & Time</label>
                <Input
                  type="datetime-local"
                  data-testid="booking-date-input"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-2 block">Notes (Optional)</label>
                <Textarea
                  data-testid="booking-notes-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                  rows="3"
                />
              </div>
              <Button
                onClick={handleBooking}
                data-testid="confirm-booking-btn"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
