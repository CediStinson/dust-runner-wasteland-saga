
import React, { useState } from 'react';
import { X, Save, UserPlus, User } from 'lucide-react';

interface LoginModalProps {
  show: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ show, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  
  if (!show) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setMessage('Please fill all fields');
      return;
    }
    
    // Simulate saving game
    setMessage('Game saved successfully!');
    setTimeout(() => {
      setMessage('');
      onClose();
    }, 2000);
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="bg-gray-900 rounded-lg p-6 border border-amber-500/50 w-full max-w-md relative z-50">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <div className="inline-block p-3 rounded-full bg-amber-600/20 mb-3">
            <Save size={28} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {isLogin ? 'Login to Save Game' : 'Register New Account'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {isLogin ? 'Sign in to save your progress' : 'Create an account to save your game'}
          </p>
        </div>
        
        {message && (
          <div className="mb-4 p-3 bg-green-600/20 border border-green-500/50 rounded text-green-400 text-center">
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
              placeholder="your@email.com"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
              placeholder="********"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {isLogin ? (
              <>
                <User size={18} />
                <span>Login & Save Game</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register & Save Game</span>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-amber-400 hover:text-amber-300 text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
