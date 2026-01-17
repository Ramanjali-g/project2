import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Search, User, Bell, Menu } from 'lucide-react';

export const MobileNav = () => {
  const { user } = useAuth();

  const getNavItems = () => {
    if (!user) {
      return [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Services', path: '/services' },
        { icon: User, label: 'Login', path: '/login' },
      ];
    }

    if (user.role === 'customer') {
      return [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Services', path: '/services' },
        { icon: Bell, label: 'Bookings', path: '/customer/bookings' },
        { icon: User, label: 'Profile', path: '/customer/dashboard' },
      ];
    }

    if (user.role === 'provider') {
      return [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Menu, label: 'Services', path: '/provider/services' },
        { icon: Bell, label: 'Requests', path: '/provider/bookings' },
        { icon: User, label: 'Dashboard', path: '/provider/dashboard' },
      ];
    }

    if (user.role === 'admin') {
      return [
        { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: User, label: 'Users', path: '/admin/users' },
        { icon: Menu, label: 'Providers', path: '/admin/providers' },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 p-4 flex justify-around items-center z-50">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          data-testid={`mobile-nav-${item.label.toLowerCase()}`}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-violet-400 transition-colors"
        >
          <item.icon size={20} />
          <span className="text-xs">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" data-testid="logo-link" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">EP</span>
            </div>
            <span className="text-xl font-heading font-bold gradient-text">Endless Path</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {!user ? (
              <>
                <Link to="/" data-testid="nav-home" className="text-slate-300 hover:text-white transition-colors">Home</Link>
                <Link to="/services" data-testid="nav-services" className="text-slate-300 hover:text-white transition-colors">Services</Link>
                <Link to="/about" data-testid="nav-about" className="text-slate-300 hover:text-white transition-colors">About</Link>
                <Link to="/login" data-testid="nav-login" className="btn-secondary">Login</Link>
                <Link to="/register" data-testid="nav-register" className="btn-primary">Register</Link>
              </>
            ) : (
              <>
                {user.role === 'customer' && (
                  <>
                    <Link to="/services" data-testid="nav-services" className="text-slate-300 hover:text-white transition-colors">Services</Link>
                    <Link to="/customer/bookings" data-testid="nav-bookings" className="text-slate-300 hover:text-white transition-colors">My Bookings</Link>
                    <Link to="/customer/dashboard" data-testid="nav-dashboard" className="text-slate-300 hover:text-white transition-colors">Dashboard</Link>
                  </>
                )}
                {user.role === 'provider' && (
                  <>
                    <Link to="/provider/services" data-testid="nav-my-services" className="text-slate-300 hover:text-white transition-colors">My Services</Link>
                    <Link to="/provider/bookings" data-testid="nav-requests" className="text-slate-300 hover:text-white transition-colors">Requests</Link>
                    <Link to="/provider/dashboard" data-testid="nav-dashboard" className="text-slate-300 hover:text-white transition-colors">Dashboard</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin/dashboard" data-testid="nav-admin-dashboard" className="text-slate-300 hover:text-white transition-colors">Dashboard</Link>
                    <Link to="/admin/providers" data-testid="nav-admin-providers" className="text-slate-300 hover:text-white transition-colors">Providers</Link>
                    <Link to="/admin/users" data-testid="nav-admin-users" className="text-slate-300 hover:text-white transition-colors">Users</Link>
                  </>
                )}
                <span className="text-slate-400">{user.full_name}</span>
                <button onClick={logout} data-testid="logout-btn" className="btn-secondary">Logout</button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
