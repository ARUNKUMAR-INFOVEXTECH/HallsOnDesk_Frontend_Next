'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';

interface CurrencyFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  currencySymbol?: string;
  helperText?: string;
  className?: string;
}

export function CurrencyField({
  name,
  label,
  currencySymbol = '₹',
  helperText,
  className = '',
  placeholder = '0.00',
  ...props
}: CurrencyFieldProps) {
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

      <div className="relative rounded-md shadow-custom-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-slate-400 text-sm font-medium">{currencySymbol}</span>
        </div>
        <input
          id={name}
          type="number"
          step="any"
          placeholder={placeholder}
          className={`block w-full pl-8 pr-3 py-2 text-sm bg-white border rounded-md transition-all outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent ${
            errorMessage
              ? 'border-red-500 focus:ring-red-400'
              : 'border-slate-200 hover:border-slate-300 focus:ring-primary-light'
          }`}
          {...register(name, { valueAsNumber: true })}
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
