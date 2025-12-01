import React, { useState } from 'react';
import { Logo } from './Logo';
import { ArrowRight, AlertTriangle, Lock, Ticket } from 'lucide-react';
import type { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      if (!email.includes('@') || password.length < 4) {
        setError('ACCESS DENIED. CREDENTIALS INVALID.');
        setIsLoading(false);
        return;
      }

      // Mock Login Success
      onLogin({
        username: email.split('@')[0],
        email: email,
      });
    }, 1500);
  };

  const handleGuestLogin = () => {
    setError('');
    setIsLoading(true);
    
    setTimeout(() => {
      onLogin({
        username: 'guest_user',
        email: 'guest@fitted.com',
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white border-2 border-black hard-shadow flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        
        {/* Left Side: Visuals */}
        <div className="md:w-1/2 bg-black text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-black uppercase mb-2">Member<br/>Access</h2>
            <div className="h-1 w-20 bg-blue-600 mb-6"></div>
            <p className="font-mono text-sm opacity-80">
              Enter the archive. Build your rotation. Connect with the culture.
            </p>
          </div>
          
          <div className="relative z-10 font-mono text-xs opacity-50 mt-12 md:mt-0">
            SYSTEM STATUS: ONLINE<br/>
            VERSION: 2.0.4-ALPHA
          </div>

          {/* Abstract background element */}
          <div className="absolute -bottom-10 -right-10 w-64 h-64 border-[20px] border-blue-600 rounded-full opacity-20 blur-xl"></div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="mb-8 scale-75 origin-left">
            <Logo />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-bold text-xs uppercase mb-2">Email Address</label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="USER@FITTED.COM"
                className="w-full bg-white border-2 border-black p-3 font-mono text-sm focus:outline-none focus:bg-blue-50 focus:border-blue-600 transition-colors placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block font-bold text-xs uppercase mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border-2 border-black p-3 font-mono text-sm focus:outline-none focus:bg-blue-50 focus:border-blue-600 transition-colors placeholder:text-gray-400"
              />
            </div>

            {error && (
              <div className="bg-red-500 text-white p-3 text-xs font-mono border-2 border-black flex items-center gap-2 animate-pulse">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-black text-white font-bold uppercase py-4 border-2 border-transparent hover:bg-blue-600 hover:border-blue-600 hard-shadow active:translate-y-[2px] active:shadow-none transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : (
                <>Enter The Archive <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Guest Access Divider */}
          <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-mono uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button 
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full bg-white text-gray-600 font-bold uppercase py-3 border-2 border-dashed border-gray-300 hover:border-black hover:text-black hover:bg-gray-50 transition-all flex justify-center items-center gap-2 text-xs tracking-widest disabled:opacity-50"
          >
            <Ticket size={16} /> Use Guest Pass
          </button>

          <div className="mt-8 pt-6 border-t-2 border-gray-200 flex justify-between items-center text-xs font-mono text-gray-500">
            <a href="#" className="hover:text-black hover:underline">FORGOT PASS?</a>
            <a href="#" className="flex items-center gap-1 hover:text-black hover:underline">
              <Lock size={12} /> REQUEST INVITE
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
