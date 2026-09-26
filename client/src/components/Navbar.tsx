import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-emerald-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                Vitalis AI
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition">Dashboard</Link>
                <Link to="/plan" className="text-gray-300 hover:text-white transition">Plan</Link>
                <Link to="/progress" className="text-gray-300 hover:text-white transition">Progress</Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition">Login</Link>
                <Link to="/register" className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition">
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <Link to="/plan" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Plan</Link>
                <Link to="/progress" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Progress</Link>
                <button
                  onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <LogOut className="h-5 w-5" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
