
import React, { useState } from 'react';

interface LoginModalProps {
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ showLoginModal, setShowLoginModal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    // Simulate successful login/signup
    alert(`Successfully ${isLogin ? 'logged in' : 'signed up'}!`);
    setShowLoginModal(false);
  };

  if (!showLoginModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-30 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {isLogin ? 'Login to Save Progress' : 'Create an Account'}
          </h2>
          <button 
            onClick={() => setShowLoginModal(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {errorMessage && (
          <div className="mb-4 p-2 bg-red-900/50 border border-red-800 rounded text-red-200 text-sm">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300 mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              placeholder="your@email.com"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-300 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded transition-colors"
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
            
            <div className="text-center text-sm text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMessage('');
                }}
                className="text-blue-400 hover:text-blue-300"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
