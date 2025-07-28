import React from 'react';
import { Calculator, TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Calculator className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">BudgetSplit Pro</h1>
              <p className="text-blue-100 text-sm">Smart payment distribution for software teams</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* User info */}
            {user && (
              <div className="hidden md:flex items-center space-x-2 bg-white/20 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            )}
            <div className="hidden md:flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">Professional Edition</span>
            </div>
            {/* Logout button on the right */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;