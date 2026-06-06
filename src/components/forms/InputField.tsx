'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  helperText?: string;
  className?: string;
}

export function InputField({
  name,
  label,
  helperText,
  className = '',
  type = 'text',
  ...props
}: InputFieldProps) {
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
        type={type}
        className={`w-full h-9 px-3 text-sm bg-white border rounded-lg transition-all outline-none focus:ring-2 ${
          errorMessage
            ? 'border-red-500 focus:ring-red-500 focus:border-transparent'
            : 'border-slate-200 hover:border-slate-300 focus:ring-primary focus:border-transparent'
        } ${className}`}
        {...register(name)}
        {...props}
      />

      {errorMessage ? (
        <span className="text-xs text-red-500 font-semibold mt-1">{errorMessage}</span>
      ) : helperText ? (
        <span className="text-xs text-slate-400 mt-1">{helperText}</span>
      ) : null}
    </div>
  );
}
