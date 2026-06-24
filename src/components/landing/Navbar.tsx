'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, Home } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface NavbarProps {
  onBookDemoClick: () => void;
}

export default function Navbar({ onBookDemoClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Pricing & FAQ', href: '/pricing' },
    { label: 'Why Us', href: '/why-us' },
  ];

  const showDashboard = mounted && isAuthenticated;

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] transition-all duration-300 ${
        isScrolled 
          ? 'max-w-4xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-md py-2.5 px-6 rounded-full' 
          : 'max-w-5xl bg-white/70 backdrop-blur-md border border-slate-200/50 shadow-sm py-3 px-7 rounded-[2rem]'
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center group hover:opacity-95 transition-opacity">
          <img 
            src="/logo.png" 
            alt="Infovex Halls Logo" 
            className="h-8 w-auto object-contain shrink-0 transition-transform duration-300 group-hover:scale-103" 
          />
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-[9.5px] font-extrabold uppercase tracking-wider transition-colors relative py-1 group/link ${
                  isActive ? 'text-[#159DFC]' : 'text-slate-650 hover:text-[#0F172A]'
                }`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-[#159DFC] transition-transform duration-250 origin-left ${
                  isActive ? 'scale-x-100' : 'scale-x-0 group-hover/link:scale-x-100'
                }`} />
              </Link>
            );
          })}
          <Link
            href="/contact"
            className={`text-[9.5px] font-extrabold uppercase tracking-wider transition-colors relative py-1 group/link ${
              pathname === '/contact' ? 'text-[#159DFC]' : 'text-slate-650 hover:text-[#0F172A]'
            }`}
          >
            Contact
            <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-[#159DFC] transition-transform duration-250 origin-left ${
              pathname === '/contact' ? 'scale-x-100' : 'scale-x-0 group-hover/link:scale-x-100'
            }`} />
          </Link>
        </nav>

        {/* Right: CTA Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          {showDashboard ? (
            <Link
              href="/dashboard"
              className="bg-[#0F172A] hover:bg-[#1E293B] text-white text-[9.5px] font-extrabold px-4 py-2 rounded-full transition-all shadow-sm hover:scale-[1.02] active:scale-95"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[10px] font-extrabold px-2.5 py-1.5 text-slate-600 hover:text-[#0F172A] transition-colors"
              >
                Login
              </Link>
              <button
                onClick={onBookDemoClick}
                className="bg-[#159DFC] hover:bg-[#002499] text-[#0F172A] text-[9.5px] font-extrabold px-4.5 py-2 rounded-full transition-all shadow-md hover:scale-[1.03] active:scale-95 cursor-pointer shadow-[#159DFC]/10 hover:shadow-[#159DFC]/25 flex items-center gap-1"
              >
                Book Demo
                <ArrowRight className="h-3 w-3" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-full md:hidden focus:outline-none transition-colors text-slate-600 hover:bg-slate-100"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Floating Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl py-4.5 px-5 flex flex-col gap-3.5 animate-slideDown text-slate-700">
          <nav className="flex flex-col gap-2.5 text-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`font-extrabold py-1 uppercase tracking-wider text-[9px] transition-colors ${
                    isActive ? 'text-[#159DFC]' : 'text-slate-650 hover:text-[#0F172A]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className={`font-extrabold py-1 uppercase tracking-wider text-[9px] transition-colors ${
                pathname === '/contact' ? 'text-[#159DFC]' : 'text-slate-650 hover:text-[#0F172A]'
              }`}
            >
              Contact
            </Link>
          </nav>
          <div className="flex flex-col gap-2 pt-2.5 border-t border-slate-100">
            {showDashboard ? (
              <Link
                onClick={() => setIsOpen(false)}
                href="/dashboard"
                className="w-full text-center text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-full py-2 text-[10px] font-bold shadow-sm"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  onClick={() => setIsOpen(false)}
                  href="/login"
                  className="w-full text-center hover:bg-slate-50 text-slate-650 rounded-full py-2 text-[10px] font-bold"
                >
                  Login
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onBookDemoClick();
                  }}
                  className="w-full text-center text-[#0F172A] bg-[#159DFC] hover:bg-[#002499] rounded-full py-2 text-[10px] font-extrabold shadow-md hover:scale-[1.02] transition-transform"
                >
                  Book Demo
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
