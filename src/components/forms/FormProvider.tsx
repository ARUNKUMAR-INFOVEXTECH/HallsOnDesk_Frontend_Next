'use client';

import React from 'react';
import { FormProvider as RHFProvider, UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form';

interface FormProviderProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  children: React.ReactNode;
  className?: string;
}

export function FormProvider<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className = 'space-y-4',
}: FormProviderProps<TFieldValues>) {
  return (
    <RHFProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className} noValidate>
        {children}
      </form>
    </RHFProvider>
  );
}
