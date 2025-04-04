
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface LoginModalProps {
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ showLogin, setShowLogin }) => {
  const [email, setEmail] = useState('');

  if (!showLogin) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() !== '') {
      // Simulate login
      window.dispatchEvent(new CustomEvent('userLoggedIn', {
        detail: { email }
      }));
      setShowLogin(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-auto">
      <div className="bg-gray-900 border border-amber-500/30 rounded-lg w-full max-w-md p-6 relative">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={() => setShowLogin(false)}
        >
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-bold text-amber-300 mb-4">Save Your Progress</h2>
        <p className="text-gray-300 mb-6">Please enter your email to save your game progress</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300 mb-2">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="youremail@example.com"
              required
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
              onClick={() => setShowLogin(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-500 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
