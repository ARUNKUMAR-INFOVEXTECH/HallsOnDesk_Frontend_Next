'use client';

import React, { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

export default function ProductProvider({ children }: { children: React.ReactNode }) {
  const activeProduct = useUIStore((state) => state.activeProduct);

  useEffect(() => {
    // Synchronize active product theme classes on document container
    if (typeof document !== 'undefined') {
      const rootClasses = document.documentElement.classList;
      rootClasses.remove('theme-schools', 'theme-rooms', 'theme-leads');
      if (activeProduct !== 'halls') {
        rootClasses.add(`theme-${activeProduct}`);
      }
    }
  }, [activeProduct]);

  return <>{children}</>;
}
