import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hexagon } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/connect-wallet');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-[rgb(var(--color-bg-dark))] to-blue-950/20">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="relative">
          <Hexagon className="w-20 h-20 text-blue-500" strokeWidth={1.5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl tracking-tight">AssetToken</h1>
          <p className="text-[rgb(var(--color-text-secondary))] text-sm max-w-xs">
            Verified access to real-world assets on blockchain
          </p>
        </div>
      </div>
    </div>
  );
};
