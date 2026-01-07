import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  padding = 'md',
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const interactiveStyles = onClick ? 'cursor-pointer hover:bg-[rgb(var(--color-bg-hover))] transition-colors' : '';
  
  return (
    <div
      className={`bg-[rgb(var(--color-bg-card))] rounded-xl border border-[rgb(var(--color-border))] ${paddingStyles[padding]} ${interactiveStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
