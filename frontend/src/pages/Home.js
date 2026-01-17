import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Users, Star, MapPin, Phone, Mail, Instagram, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API } from '../context/AuthContext';

export const HomePage = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const getCategoryIcon = (iconName) => {
    const icons = {
      'alert-circle': '🚨',
      'wrench': '🔧',
      'home': '🏠',
      'printer': '🖨️',
      'truck': '🚚',
      'utensils': '🍽️',
      'building': '🏢',
      'hard-hat': '👷',
      'book': '📚',
      'tractor': '🚜',
      'recycle': '♻️',
      'grid': '📱'
    };
    return icons[iconName] || '⚡';
  };

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-violet-900/20 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight">
                Your Path to
                <span className="gradient-text block">Endless Services</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-8">
                Connect with trusted local service providers. From emergency repairs to daily needs, find the help you need in Vijayawada.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/services" data-testid="hero-browse-services-btn" className="btn-primary">
                  Browse Services <ArrowRight className="inline ml-2" size={20} />
                </Link>
                <Link to="/register" data-testid="hero-become-provider-btn" className="btn-secondary">
                  Become a Provider
                </Link>
              </div>
              <div className="mt-12 flex items-center gap-8">
                <div>
                  <p className="text-3xl font-bold gradient-text">5</p>
                  <p className="text-slate-400 text-sm">Free Credits</p>
                </div>
                <div className="h-12 w-px bg-slate-800"></div>
                <div>
                  <p className="text-3xl font-bold gradient-text">12</p>
                  <p className="text-slate-400 text-sm">Service Categories</p>
                </div>
                <div className="h-12 w-px bg-slate-800"></div>
                <div>
                  <p className="text-3xl font-bold gradient-text">24/7</p>
                  <p className="text-slate-400 text-sm">Support</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="glass-card p-8 neon-glow">
                <img
                  src="https://images.unsplash.com/photo-1686043326751-d8e49931906b?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Service Provider"
                  className="rounded-lg w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-heading font-bold text-center mb-4">
            Why Choose <span className="gradient-text">Endless Path</span>
          </h2>
          <p className="text-center text-slate-400 mb-12 text-lg">The most comprehensive service platform in Vijayawada</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 hover:neon-glow transition-all">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center mb-4">
                <Shield size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Verified Providers</h3>
              <p className="text-slate-400">All service providers are verified by our admin team before they can accept jobs.</p>
            </div>
            <div className="glass-card p-8 hover:neon-glow transition-all">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center mb-4">
                <Zap size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Instant Booking</h3>
              <p className="text-slate-400">Book services instantly with your free credits or subscription plan.</p>
            </div>
            <div className="glass-card p-8 hover:neon-glow transition-all">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center mb-4">
                <Users size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Local Community</h3>
              <p className="text-slate-400">Support local service providers and build lasting relationships.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold mb-4">
              Our <span className="gradient-text">Service Categories</span>
            </h2>
            <p className="text-slate-400 text-lg">Comprehensive services for every need - The heart of our platform</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, idx) => (
              <Link
                key={category.id}
                to="/services"
                data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="glass-card p-6 hover:neon-glow transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{getCategoryIcon(category.icon)}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-heading font-bold mb-2 group-hover:text-violet-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-400 mb-3">{category.description}</p>
                    {category.sub_services && category.sub_services.length > 0 && (
                      <div className="space-y-1">
                        {category.sub_services.slice(0, 3).map((service, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                            <CheckCircle size={12} className="text-violet-400" />
                            <span>{service}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/services" data-testid="view-all-services-btn" className="btn-primary">
              View All Services <ArrowRight className="inline ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-12 text-center">
            <h2 className="text-4xl font-heading font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-slate-400 text-lg mb-8">Join thousands of satisfied customers and providers</p>
            <div className="flex justify-center gap-4">
              <Link to="/register" data-testid="cta-register-btn" className="btn-primary">
                Sign Up Now
              </Link>
              <Link to="/services" data-testid="cta-services-btn" className="btn-secondary">
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">EP</span>
                </div>
                <span className="text-xl font-heading font-bold gradient-text">Endless Path</span>
              </div>
              <p className="text-slate-400 text-sm">Connecting communities with trusted local services in Vijayawada.</p>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/" className="hover:text-violet-400">Home</Link></li>
                <li><Link to="/services" className="hover:text-violet-400">Services</Link></li>
                <li><Link to="/about" className="hover:text-violet-400">About</Link></li>
                <li><Link to="/register" className="hover:text-violet-400">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="flex items-center gap-2"><Mail size={16} /> endlesspath56@gmail.com</li>
                <li className="flex items-center gap-2"><Phone size={16} /> +91 91822 98869</li>
                <li className="flex items-center gap-2"><MapPin size={16} /> Vijayawada, AP, India</li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-4">Follow Us</h4>
              <a href="https://instagram.com/endlesspath._" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-violet-400">
                <Instagram size={20} /> @endlesspath._
              </a>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500 text-sm">
            <p>&copy; 2025 Endless Path. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const AboutPage = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-heading font-bold gradient-text mb-8 text-center">About Endless Path</h1>
        <div className="glass-card p-8 space-y-6 text-slate-300">
          <p className="text-lg leading-relaxed">
            Endless Path is a revolutionary platform designed to connect customers with skilled local service providers across Vijayawada and beyond. We believe in creating employment opportunities while making quality services accessible to everyone.
          </p>
          <h2 className="text-2xl font-heading font-bold text-white mt-8 mb-4">Our Mission</h2>
          <p className="leading-relaxed">
            To empower local communities by bridging the gap between service seekers and providers, creating a sustainable ecosystem where everyone thrives.
          </p>
          <h2 className="text-2xl font-heading font-bold text-white mt-8 mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="bg-slate-900/50 p-6 rounded-lg">
              <div className="text-3xl mb-3">1️⃣</div>
              <h3 className="font-bold mb-2">Browse Services</h3>
              <p className="text-sm text-slate-400">Explore our wide range of service categories</p>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-lg">
              <div className="text-3xl mb-3">2️⃣</div>
              <h3 className="font-bold mb-2">Book Instantly</h3>
              <p className="text-sm text-slate-400">Use your free credits or subscription to book</p>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-lg">
              <div className="text-3xl mb-3">3️⃣</div>
              <h3 className="font-bold mb-2">Get It Done</h3>
              <p className="text-sm text-slate-400">Verified providers complete your job</p>
            </div>
          </div>
          <h2 className="text-2xl font-heading font-bold text-white mt-8 mb-4">Subscription Plans</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6 border-2 border-violet-500/30">
              <h3 className="text-xl font-bold mb-2">Monthly Plan</h3>
              <p className="text-3xl font-bold gradient-text mb-4">₹99<span className="text-sm text-slate-400">/month</span></p>
              <p className="text-slate-400">Unlimited bookings for 30 days</p>
            </div>
            <div className="glass-card p-6 border-2 border-cyan-500/30">
              <h3 className="text-xl font-bold mb-2">Yearly Plan</h3>
              <p className="text-3xl font-bold gradient-text mb-4">₹1199<span className="text-sm text-slate-400">/year</span></p>
              <p className="text-slate-400">Unlimited bookings for 365 days</p>
            </div>
          </div>
          <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-6 mt-8">
            <h3 className="font-bold text-lg mb-2">New User Bonus</h3>
            <p className="text-slate-300">Every new user gets <span className="text-violet-400 font-bold">5 free credits</span> to try our services!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
