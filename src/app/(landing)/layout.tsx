'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import DemoModal from '@/components/landing/DemoModal';
import { LandingContext } from '@/components/landing/LandingContext';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openDemoModal = () => setIsDemoOpen(true);
  const closeDemoModal = () => setIsDemoOpen(false);

  return (
    <LandingContext.Provider value={{ openDemoModal, closeDemoModal }}>
      <div className="min-h-screen bg-white text-slate-800 antialiased flex flex-col justify-between selection:bg-[#159DFC] selection:text-[#0F172A]">
        {/* Sticky App Header */}
        <Navbar onBookDemoClick={openDemoModal} />

        {/* Landing page Body Folds */}
        <main className="flex-1">
          {children}
        </main>

        {/* Layout footer links */}
        <Footer />

        {/* Demo Booking Dialog Popup */}
        {mounted && (
          <DemoModal isOpen={isDemoOpen} onClose={closeDemoModal} />
        )}
      </div>
    </LandingContext.Provider>
  );
}
