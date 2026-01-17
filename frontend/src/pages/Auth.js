import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, Briefcase, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Login successful!');
      if (user.role === 'customer') navigate('/customer/dashboard');
      else if (user.role === 'provider') navigate('/provider/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md">
        <h2 className="text-3xl font-heading font-bold gradient-text mb-6">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
              <input
                type="email"
                data-testid="login-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
              <input
                type="password"
                data-testid="login-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            data-testid="login-submit-btn"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" data-testid="register-link" className="text-violet-400 hover:text-violet-300">Register</Link>
        </p>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'customer',
    service_category: '',
    experience_years: 0,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-20">
      <div className="glass-card p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-heading font-bold gradient-text mb-6">Join Endless Path</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 text-sm mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-500" size={20} />
                <input
                  type="text"
                  data-testid="register-name-input"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-slate-300 text-sm mb-2 block">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-slate-500" size={20} />
                <input
                  type="tel"
                  data-testid="register-phone-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
              <input
                type="email"
                data-testid="register-email-input"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-sm mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
              <input
                type="password"
                data-testid="register-password-input"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-sm mb-2 block">I want to</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                data-testid="role-customer-btn"
                onClick={() => setFormData({...formData, role: 'customer'})}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.role === 'customer'
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <User className="mx-auto mb-2" size={24} />
                <p className="font-medium">Find Services</p>
              </button>
              <button
                type="button"
                data-testid="role-provider-btn"
                onClick={() => setFormData({...formData, role: 'provider'})}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.role === 'provider'
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <Briefcase className="mx-auto mb-2" size={24} />
                <p className="font-medium">Provide Services</p>
              </button>
            </div>
          </div>

          {formData.role === 'provider' && (
            <>
              <div>
                <label className="text-slate-300 text-sm mb-2 block">Service Category</label>
                <select
                  data-testid="register-category-select"
                  value={formData.service_category}
                  onChange={(e) => setFormData({...formData, service_category: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Select category</option>
                  <option value="Emergency Services">Emergency Services</option>
                  <option value="Technical & Utility Services">Technical & Utility Services</option>
                  <option value="Home & Daily Need Services">Home & Daily Need Services</option>
                  <option value="Printing & Business Support">Printing & Business Support</option>
                  <option value="Transport & Travel Services">Transport & Travel Services</option>
                  <option value="Food Services">Food Services</option>
                  <option value="Real Estate & Event Services">Real Estate & Event Services</option>
                  <option value="Manpower & Construction Support">Manpower & Construction Support</option>
                  <option value="Education & Training">Education & Training</option>
                  <option value="Agriculture Support">Agriculture Support</option>
                  <option value="Waste Management">Waste Management</option>
                  <option value="Open Platform Services">Open Platform Services</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-2 block">Experience (years)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-slate-500" size={20} />
                  <input
                    type="number"
                    data-testid="register-experience-input"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:ring-2 focus:ring-violet-500"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-2 block">Description</label>
                <textarea
                  data-testid="register-description-input"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-violet-500"
                  rows="3"
                />
              </div>
            </>
          )}

          <button type="submit" data-testid="register-submit-btn" disabled={loading} className="w-full btn-primary">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" data-testid="login-link" className="text-violet-400 hover:text-violet-300">Login</Link>
        </p>
      </div>
    </div>
  );
};
