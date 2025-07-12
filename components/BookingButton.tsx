'use client';

import React from 'react';
import { Calendar, Clock, ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  pulse?: boolean;
}

const BookingButton: React.FC<BookingButtonProps> = ({
  onClick,
  variant = 'primary',
  size = 'md',
  children = 'Prendre RDV',
  icon,
  className = '',
  disabled = false,
  loading = false,
  pulse = false
}) => {
  const baseClasses = 'relative overflow-hidden font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD] text-white hover:shadow-lg hover:shadow-[#00F5FF]/25 focus:ring-[#00F5FF]',
    secondary: 'bg-gray-800 text-white border border-gray-600 hover:bg-gray-700 hover:border-gray-500 focus:ring-gray-500',
    outline: 'border-2 border-[#00F5FF] text-[#00F5FF] hover:bg-[#00F5FF] hover:text-white focus:ring-[#00F5FF]',
    ghost: 'text-gray-300 hover:text-white hover:bg-white/10 focus:ring-white/20'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
    xl: 'px-10 py-5 text-xl rounded-2xl'
  };

  const defaultIcon = icon || <Calendar className="w-5 h-5" />;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        {
          'animate-pulse': pulse || loading,
          'transform hover:scale-105 active:scale-95': !disabled && !loading
        },
        className
      )}
    >
      {/* Background animation */}
      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      
      {/* Content */}
      <div className="relative z-10 flex items-center space-x-2">
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
        ) : (
          defaultIcon
        )}
        <span>{loading ? 'Chargement...' : children}</span>
        {!loading && variant === 'primary' && (
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        )}
      </div>

      {/* Pulse effect for primary variant */}
      {variant === 'primary' && pulse && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD] opacity-30 animate-ping rounded-xl" />
      )}
    </button>
  );
};

export default BookingButton;