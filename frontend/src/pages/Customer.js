import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Calendar, Star, Package, TrendingUp, IndianRupee } from 'lucide-react';
import { API, useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

export const CustomerDashboard = () => {
  const { user, refetchUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchSubscription();
    fetchRecentBookings();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await axios.get(`${API}/subscriptions/me`);
      setSubscription(response.data);
    } catch (error) {
      console.log('No active subscription');
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings/customer/me`);
      setRecentBookings(response.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const initializePayment = async (plan) => {
    setSelectedPlan(plan);
    const amount = plan.type === 'monthly' ? 9900 : 119900;

    try {
      const orderResponse = await axios.post(`${API}/payments/create-order`, {
        amount,
        currency: 'INR',
        purpose: 'subscription',
        reference_id: null
      });

      const options = {
        key: orderResponse.data.key_id,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        order_id: orderResponse.data.order_id,
        name: 'Endless Path',
        description: `${plan.type === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
        handler: async function (response) {
          try {
            await axios.post(`${API}/payments/verify`, {
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature
            });

            await axios.post(`${API}/subscriptions`, {
              plan_type: plan.type,
              amount: amount / 100,
              payment_id: response.razorpay_payment_id
            });

            toast.success('Subscription activated successfully!');
            fetchSubscription();
            refetchUser();
            setShowPayment(false);
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.full_name,
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: '#8b5cf6'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error('Failed to initialize payment');
    }
  };

  return (
    <div className="min-h-screen py-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold gradient-text mb-8">Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center">
                <CreditCard className="text-white" size={24} />
              </div>
              <span className="text-xs text-slate-400">Available</span>
            </div>
            <p className="text-3xl font-bold gradient-text">{user?.credits || 0}</p>
            <p className="text-slate-400 text-sm">Credits</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center">
                <Calendar className="text-white" size={24} />
              </div>
              <span className="text-xs text-slate-400">This Month</span>
            </div>
            <p className="text-3xl font-bold gradient-text">{recentBookings.length}</p>
            <p className="text-slate-400 text-sm">Bookings</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center">
                <Package className="text-white" size={24} />
              </div>
              <span className="text-xs text-slate-400">Status</span>
            </div>
            <p className="text-xl font-bold text-white">
              {subscription ? 'Active' : 'No Plan'}
            </p>
            <p className="text-slate-400 text-sm">Subscription</p>
          </div>
        </div>

        {!subscription && (
          <div className="glass-card p-8 mb-8">
            <h2 className="text-2xl font-heading font-bold mb-4">Upgrade Your Plan</h2>
            <p className="text-slate-400 mb-6">Get unlimited bookings with our subscription plans</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 p-6 rounded-lg border-2 border-violet-500/30">
                <h3 className="text-xl font-bold mb-2">Monthly Plan</h3>
                <p className="text-4xl font-bold gradient-text mb-4">
                  ₹99<span className="text-sm text-slate-400">/month</span>
                </p>
                <ul className="space-y-2 text-slate-300 mb-6">
                  <li>✓ Unlimited bookings</li>
                  <li>✓ Priority support</li>
                  <li>✓ No hidden fees</li>
                </ul>
                <Button
                  onClick={() => initializePayment({ type: 'monthly' })}
                  data-testid="subscribe-monthly-btn"
                  className="w-full btn-primary"
                >
                  Subscribe Now
                </Button>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-lg border-2 border-cyan-500/30">
                <h3 className="text-xl font-bold mb-2">Yearly Plan</h3>
                <p className="text-4xl font-bold gradient-text mb-4">
                  ₹1199<span className="text-sm text-slate-400">/year</span>
                </p>
                <ul className="space-y-2 text-slate-300 mb-6">
                  <li>✓ Save ₹89 per month</li>
                  <li>✓ Unlimited bookings</li>
                  <li>✓ Priority support</li>
                </ul>
                <Button
                  onClick={() => initializePayment({ type: 'yearly' })}
                  data-testid="subscribe-yearly-btn"
                  className="w-full btn-primary"
                >
                  Subscribe Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {subscription && (
          <div className="glass-card p-6 mb-8 border-2 border-violet-500/30">
            <h3 className="text-xl font-bold mb-4">Active Subscription</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Plan Type</p>
                <p className="font-medium capitalize">{subscription.plan_type}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Amount</p>
                <p className="font-medium">₹{subscription.amount}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Valid Until</p>
                <p className="font-medium">{new Date(subscription.end_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card p-6">
          <h2 className="text-2xl font-heading font-bold mb-6">Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No bookings yet</p>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} data-testid={`booking-${booking.id}`} className="bg-slate-900/50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium mb-1">{booking.service_title}</h3>
                      <p className="text-sm text-slate-400">Provider: {booking.provider_name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(booking.scheduled_date).toLocaleString()}
                      </p>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
};

export const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings/customer/me`);
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold gradient-text mb-8">My Bookings</h1>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-slate-400 text-lg">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} fetchBookings={fetchBookings} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const BookingCard = ({ booking, fetchBookings }) => {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submitReview = async () => {
    try {
      await axios.post(`${API}/reviews`, {
        booking_id: booking.id,
        rating,
        comment
      });
      toast.success('Review submitted successfully!');
      setReviewOpen(false);
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit review');
    }
  };

  return (
    <div data-testid={`booking-card-${booking.id}`} className="glass-card p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-heading font-bold mb-1">{booking.service_title}</h3>
          <p className="text-slate-400 text-sm">Provider: {booking.provider_name}</p>
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

      <div className="space-y-2 text-sm text-slate-300">
        <p><Calendar className="inline mr-2" size={16} />Scheduled: {new Date(booking.scheduled_date).toLocaleString()}</p>
        {booking.notes && <p className="text-slate-400">Notes: {booking.notes}</p>}
      </div>

      {booking.status === 'completed' && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
            <DialogTrigger asChild>
              <Button data-testid={`review-btn-${booking.id}`} className="btn-secondary">
                <Star className="inline mr-2" size={16} />
                Leave Review
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-white">Rate Your Experience</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-slate-300 text-sm mb-2 block">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        data-testid={`star-${star}`}
                        size={32}
                        className={`cursor-pointer ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-slate-300 text-sm mb-2 block">Comment (Optional)</label>
                  <textarea
                    data-testid="review-comment-input"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200"
                    rows="3"
                  />
                </div>
                <Button onClick={submitReview} data-testid="submit-review-btn" className="w-full btn-primary">
                  Submit Review
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};
