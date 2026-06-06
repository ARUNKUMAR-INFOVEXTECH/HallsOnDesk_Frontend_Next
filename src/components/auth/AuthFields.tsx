'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface FieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function EmailField({ name = 'email', label = 'Email Address', placeholder = 'e.g. name@company.com', disabled = false }: FieldProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <Mail className="h-4 w-4" />
        </div>
        <input
          id={name}
          type="email"
          disabled={disabled}
          placeholder={placeholder}
          className={`block w-full h-9 pl-9 pr-3 py-2 text-sm bg-white border rounded-lg transition-all outline-none focus:ring-2 ${
            errorMessage
              ? 'border-red-500 focus:ring-red-500 focus:border-transparent'
              : 'border-gray-200 hover:border-gray-300 focus:ring-primary-light focus:border-transparent'
          }`}
          {...register(name)}
        />
      </div>
      {errorMessage && <span className="text-xs text-red-500 font-semibold mt-1">{errorMessage}</span>}
    </div>
  );
}

export function PasswordField({ name = 'password', label = 'Password', placeholder = '••••••••', disabled = false }: FieldProps) {
  const { register, formState: { errors } } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <Lock className="h-4 w-4" />
        </div>
        <input
          id={name}
          type={showPassword ? 'text' : 'password'}
          disabled={disabled}
          placeholder={placeholder}
          className={`block w-full h-9 pl-9 pr-10 py-2 text-sm bg-white border rounded-lg transition-all outline-none focus:ring-2 ${
            errorMessage
              ? 'border-red-500 focus:ring-red-500 focus:border-transparent'
              : 'border-gray-200 hover:border-gray-300 focus:ring-primary-light focus:border-transparent'
          }`}
          {...register(name)}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-650 transition-colors focus:outline-none cursor-pointer"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {errorMessage && <span className="text-xs text-red-500 font-semibold mt-1">{errorMessage}</span>}
    </div>
  );
}

interface CheckboxProps {
  name: string;
  label: string;
  disabled?: boolean;
}

export function RememberMeCheckbox({ name = 'rememberMe', label, disabled = false }: CheckboxProps) {
  const { register } = useFormContext();

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        disabled={disabled}
        className="rounded border-slate-200 text-primary-light focus:ring-primary-light h-3.5 w-3.5 accent-[#EE9B00] cursor-pointer"
        {...register(name)}
      />
      <span className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors">
        {label}
      </span>
    </label>
  );
}
