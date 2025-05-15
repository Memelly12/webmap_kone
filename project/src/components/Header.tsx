import React from 'react';
import { useAuthStore } from '../store/authStore';
import { LogOut, User } from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white shadow-md px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">
          Système d'Information Cadastrale - Port Bouet
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-600 mr-2" />
            <span className="text-gray-700">{user?.username}</span>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center text-red-600 hover:text-red-700"
          >
            <LogOut className="w-5 h-5 mr-1" />
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};