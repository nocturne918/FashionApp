import React, { useState } from 'react';
import { Logo } from './Logo';
import { Icon } from '@iconify/react';
import { authClient } from '../lib/auth-client';

interface SignupViewProps {
  onSwitchToLogin: () => void;
}

export const SignupView: React.FC<SignupViewProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
    });

    if (error) {
      setError(error.message || 'Signup failed');
      setIsLoading(false);
    }
    // Success will trigger AuthContext update via useSession
  };

  const handleGoogleSignup = async () => {
    setError('');
    setIsLoading(true);
    const { error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: window.location.origin,
    });
    
    if (error) {
      setError(error.message || 'Google signup failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white border-2 border-black hard-shadow flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        
        {/* Left Side: Visuals */}
        <div className="md:w-1/2 bg-blue-600 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10"> 
            <h2 className="font-display text-4xl font-black uppercase mb-2">Join The<br/>Archive</h2>
            <div className="h-1 w-20 bg-black mb-6"></div>
            <p className="font-mono text-sm opacity-80">
              Create your profile. Curate your style. Define the future.
            </p>
          </div>
          
          <div className="relative z-10 font-mono text-xs opacity-50 mt-12 md:mt-0">
            SYSTEM STATUS: ONLINE<br/>
            REGISTRATION: OPEN
          </div>

          {/* Abstract background element */}
          <div className="absolute -top-10 -left-10 w-64 h-64 border-[20px] border-black rounded-full opacity-10 blur-xl"></div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="mb-8 scale-75 origin-left">
            <Logo />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-bold text-xs uppercase mb-2">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="YOUR NAME"
                className="w-full bg-white border-2 border-black p-3 font-mono text-sm focus:outline-none focus:bg-blue-50 focus:border-blue-600 transition-colors placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block font-bold text-xs uppercase mb-2">Email Address</label>
              <input 
                type="email" 
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
              <div className="bg-red-500 text-white p-3 text-xs font-mono border-2 border-black flex items-center gap-2">
                <Icon icon="lucide:alert-triangle" width={14} height={14} /> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-black text-white font-bold uppercase py-4 border-2 border-transparent hover:bg-blue-600 hover:border-blue-600 hard-shadow active:translate-y-[2px] active:shadow-none transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : (
                <>Create Account <Icon icon="lucide:arrow-right" width={18} height={18} /></>
              )}
            </button>

          </form>

          {/* Google Signup Divider */}
          <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-mono uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Signup */}
          <div>
            <button 
              type="button"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full bg-white text-black font-bold uppercase py-3 border-2 border-black hover:bg-gray-50 hard-shadow active:translate-y-[2px] active:shadow-none transition-all flex justify-center items-center gap-2 text-xs tracking-widest disabled:opacity-50"
            >
              <Icon icon="logos:google-icon" width={16} height={16} /> Continue with Google
            </button>
          </div>

          <div className="mt-8 pt-6 border-t-2 border-gray-200 flex justify-center items-center text-xs font-mono text-gray-500">
            <span>ALREADY A MEMBER?</span>
            <button 
              onClick={onSwitchToLogin}
              className="ml-2 font-bold text-black hover:text-blue-600 hover:underline uppercase"
            >
              LOG IN
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
