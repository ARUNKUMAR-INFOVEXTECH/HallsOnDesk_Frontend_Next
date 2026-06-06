'use client';

import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Problems from '@/components/landing/Problems';
import Features from '@/components/landing/Features';
import FoundingProgram from '@/components/landing/FoundingProgram';
import Pricing from '@/components/landing/Pricing';
import WhyUs from '@/components/landing/WhyUs';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';
import DemoModal from '@/components/landing/DemoModal';
import { ArrowUpRight } from 'lucide-react';

export default function Home() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-700 antialiased flex flex-col justify-between selection:bg-primary-light selection:text-primary">
      
      {/* Sticky App Header */}
      <Navbar onBookDemoClick={() => setIsDemoOpen(true)} />

      {/* Landing page Body Folds */}
      <div className="flex-1">
        {/* 1. Hero Section */}
        <Hero onBookDemoClick={() => setIsDemoOpen(true)} />

        {/* 2. Problems & Old workflow comparison Section */}
        <Problems />

        {/* 3. Core Solution features Section */}
        <Features />

        {/* 4. Founding Hall Program Banner */}
        <FoundingProgram onBookDemoClick={() => setIsDemoOpen(true)} />

        {/* 5. Pricing subscriptions grid Section */}
        <Pricing onBookDemoClick={() => setIsDemoOpen(true)} />

        {/* 6. Why HallsOnDesk Section */}
        <WhyUs />

        {/* 7. Client Testimonials review grid Section */}
        <Testimonials />

        {/* 8. Accordion FAQ list Section */}
        <FAQ />

        {/* Final CTA Section */}
        <section className="py-24 bg-slate-50/50 border-t border-slate-100 text-center">
          <div className="max-w-4xl mx-auto px-6 space-y-6">
            <h2 className="text-3xl font-bold text-primary tracking-tight leading-tight">
              Ready To Digitize Your Marriage Hall Bookings?
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed font-semibold">
              Join Tamil Nadu's marriage halls using HallsOnDesk to manage registers, payments, staff tasks, and customer logs in one dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 items-center justify-center pt-4">
              <button
                onClick={() => setIsDemoOpen(true)}
                className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white h-10 px-6 rounded-lg text-sm font-semibold transition-colors duration-200 cursor-pointer shadow-sm"
              >
                Book Free Demo
              </button>
              <a
                href="mailto:info@infovex.in"
                className="w-full sm:w-auto flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 h-10 px-6 rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-sm"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Layout footer links */}
      <Footer />

      {/* Demo Booking Dialog Popup */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      
    </div>
  );
}
