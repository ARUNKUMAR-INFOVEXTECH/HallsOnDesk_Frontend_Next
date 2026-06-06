'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Globe } from 'lucide-react';

interface NavbarProps {
  onBookDemoClick: () => void;
}

export default function Navbar({ onBookDemoClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: 'mailto:info@infovex.in' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm'
          : 'bg-white border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="h-9 w-9 rounded-xl bg-[#071426] flex items-center justify-center border border-[#1E2E44] shrink-0 shadow-sm">
            <Globe className="h-5 w-5 text-[#EE9B00]" />
          </div>
          <div>
            <span className="font-bold text-sm leading-none tracking-tight block text-slate-900">
              Halls<span className="text-[#EE9B00]">OnDesk</span>
            </span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-1">
              by Infovex
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-wider"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="hover:bg-slate-50 text-slate-600 h-9 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center justify-center"
          >
            Login
          </Link>
          <button
            onClick={onBookDemoClick}
            className="bg-primary hover:bg-primary-hover text-white h-9 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 cursor-pointer shadow-sm"
          >
            Book Demo
          </button>
        </div>

        {/* Mobile Hamburger menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 lg:hidden focus:outline-none"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Panel */}
      {isOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white shadow-lg py-4 px-6 flex flex-col gap-4 animate-slideDown text-sm">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-bold text-slate-650 hover:text-primary py-1 uppercase tracking-wider"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full text-center hover:bg-slate-50 text-slate-600 rounded-lg py-2 font-semibold"
            >
              Login
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                onBookDemoClick();
              }}
              className="w-full text-center text-white bg-primary hover:bg-primary-hover rounded-lg py-2 font-semibold cursor-pointer shadow-sm"
            >
              Book Demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
