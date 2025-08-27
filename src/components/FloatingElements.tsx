import React from 'react';

export const FloatingElements: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating geometric shapes */}
      <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-primary/10 rounded-2xl rotate-12 animate-pulse" 
           style={{ animationDelay: '0s', animationDuration: '4s' }} />
      
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-secondary/10 rounded-full animate-pulse" 
           style={{ animationDelay: '1s', animationDuration: '5s' }} />
      
      <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-accent/10 rounded-lg rotate-45 animate-pulse" 
           style={{ animationDelay: '2s', animationDuration: '3s' }} />
      
      <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-primary/5 rounded-3xl -rotate-12 animate-pulse" 
           style={{ animationDelay: '0.5s', animationDuration: '6s' }} />

      {/* Floating dots */}
      <div className="absolute top-1/2 left-1/6 w-3 h-3 bg-primary/20 rounded-full animate-bounce" 
           style={{ animationDelay: '1.5s', animationDuration: '2s' }} />
      
      <div className="absolute top-2/3 right-1/6 w-2 h-2 bg-secondary/20 rounded-full animate-bounce" 
           style={{ animationDelay: '2.5s', animationDuration: '2.5s' }} />
    </div>
  );
};