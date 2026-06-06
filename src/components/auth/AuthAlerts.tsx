'use client';

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AlertProps {
  message: string;
}

export function AuthErrorAlert({ message }: AlertProps) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-fadeIn">
      <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}

export function AuthSuccessAlert({ message }: AlertProps) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-xs font-medium animate-fadeIn">
      <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500 mt-0.5" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}
