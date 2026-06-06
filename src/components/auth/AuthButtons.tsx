'use client';

import React from 'react';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
}

export function AuthButton({
  children,
  loading = false,
  loadingText = 'Authenticating...',
  className = '',
  disabled,
  type = 'submit',
  ...props
}: AuthButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`w-full flex items-center justify-center gap-2 mt-4 py-2 px-4 text-white bg-primary hover:bg-primary-hover rounded-lg text-sm font-medium transition-colors duration-200 h-9 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
