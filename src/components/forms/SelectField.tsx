'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  options: readonly SelectOption[] | SelectOption[];
  label?: string;
  placeholder?: string;
  helperText?: string;
  className?: string;
}

export function SelectField({
  name,
  options,
  label,
  placeholder = 'Select an option',
  helperText,
  className = '',
  ...props
}: SelectFieldProps) {
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

      <div className="relative">
        <select
          id={name}
          className={`w-full px-3 py-2 text-sm bg-white border rounded-md appearance-none transition-all outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent ${
            errorMessage
              ? 'border-red-500 focus:ring-red-400'
              : 'border-slate-200 hover:border-slate-300 focus:ring-primary-light'
          }`}
          {...register(name)}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Custom Chevron Indicator */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>

      {errorMessage ? (
        <span className="text-xs text-red-500 font-medium">{errorMessage}</span>
      ) : helperText ? (
        <span className="text-xs text-slate-400">{helperText}</span>
      ) : null}
    </div>
  );
}
