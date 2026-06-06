'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';

interface DateFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  helperText?: string;
  className?: string;
}

export function DateField({
  name,
  label,
  helperText,
  className = '',
  ...props
}: DateFieldProps) {
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

      <input
        id={name}
        type="date"
        className={`px-3 py-2 text-sm bg-white border rounded-md transition-all outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent ${
          errorMessage
            ? 'border-red-500 focus:ring-red-400'
            : 'border-slate-200 hover:border-slate-300 focus:ring-primary-light'
        }`}
        {...register(name)}
        {...props}
      />

      {errorMessage ? (
        <span className="text-xs text-red-500 font-medium">{errorMessage}</span>
      ) : helperText ? (
        <span className="text-xs text-slate-400">{helperText}</span>
      ) : null}
    </div>
  );
}
