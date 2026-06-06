'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';

interface PhoneFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  helperText?: string;
  className?: string;
}

export function PhoneField({
  name,
  label,
  helperText,
  className = '',
  placeholder = '98765 43210',
  ...props
}: PhoneFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-xs font-semibold uppercase tracking-wider text-slate-500"
        >
          {label}
        </label>
      )}

      <div className="relative flex rounded-md">
        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm">
          +91
        </span>
        <input
          id={name}
          type="tel"
          placeholder={placeholder}
          className={`block w-full px-3 py-2 text-sm bg-white border rounded-r-md transition-all outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent ${
            errorMessage
              ? 'border-red-500 focus:ring-red-400'
              : 'border-slate-200 hover:border-slate-300 focus:ring-primary-light'
          }`}
          {...register(name)}
          {...props}
        />
      </div>

      {errorMessage ? (
        <span className="text-xs text-red-500 font-medium">{errorMessage}</span>
      ) : helperText ? (
        <span className="text-xs text-slate-400">{helperText}</span>
      ) : null}
    </div>
  );
}
