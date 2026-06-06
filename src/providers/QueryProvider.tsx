'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes cache stale
            gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
            retry: 1, // Only retry once for failed calls in production
            refetchOnWindowFocus: false, // Prevent redundant background fetches on focus
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
