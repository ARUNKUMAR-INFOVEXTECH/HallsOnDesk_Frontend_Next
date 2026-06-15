'use client';

import React, { createContext, useContext } from 'react';

interface LandingContextType {
  openDemoModal: () => void;
  closeDemoModal: () => void;
}

export const LandingContext = createContext<LandingContextType>({
  openDemoModal: () => {},
  closeDemoModal: () => {},
});

export const useLanding = () => useContext(LandingContext);
