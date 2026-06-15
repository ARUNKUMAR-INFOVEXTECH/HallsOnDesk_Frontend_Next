'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function Footer() {
  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Pricing Plans & FAQ', href: '/pricing' },
    { label: 'Why Us', href: '/why-us' },
    { label: 'Contact Us', href: '/contact' },
  ];

  const productFeatures = [
    { label: 'Booking Management', href: '/features' },
    { label: 'Interactive Calendar', href: '/features' },
    { label: 'Customer Directory', href: '/features' },
    { label: 'Payment Tracking', href: '/features' },
  ];

  return (
    <footer className="bg-[#0A2540] text-slate-300 border-t border-slate-800/80 relative overflow-hidden">
      {/* Glow highlight inside footer */}
      <div className="absolute -top-24 left-1/4 h-48 w-96 bg-[#EE9B00]/4 rounded-full blur-[80px] pointer-events-none" />

      {/* SVG logo gradient definition */}
      <svg className="absolute w-0 h-0" width="0" height="0">
        <defs>
          <linearGradient id="footer-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EE9B00" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>
      </svg>

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Column 1: Brand Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 text-white hover:opacity-90">
              <div className="h-9 w-9 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center border border-white/20 shrink-0">
                <img src="/favicon.png" alt="Infovex Halls Icon" className="h-full w-full object-cover" />
              </div>
              <div>
                <span className="font-bold text-sm leading-none tracking-tight block text-white">
                  Infovex <span className="text-[#EE9B00]">Halls</span>
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-1">
                  Marriage Hall CRM & ERP
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              India's first dedicated venue CRM and management system helping marriage hall operators automate bookings, collections, and schedules smoothly.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-5">Quick Links</h4>
            <ul className="space-y-3 text-xs font-semibold">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="hover:text-white hover:underline decoration-[#EE9B00] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Product Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-5">Platform Modules</h4>
            <ul className="space-y-3 text-xs font-semibold">
              {productFeatures.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="hover:text-[#EE9B00] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact details */}
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-5">Contact Sales</h4>
            <div className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-[#EE9B00] shrink-0 mt-0.5" />
              <a href="mailto:info@infovex.in" className="hover:text-white transition-colors">
                info@infovex.in
              </a>
            </div>
            <div className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 text-[#EE9B00] shrink-0 mt-0.5" />
              <a href="tel:+919876543210" className="hover:text-white transition-colors">
                +91 98765 43210
              </a>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-[#EE9B00] shrink-0 mt-0.5" />
              <span className="text-slate-300 leading-relaxed font-semibold">
                Infovex Technologies, Chennai, Tamil Nadu, India
              </span>
            </div>
          </div>

        </div>

        {/* Footer Bottom copyright info */}
        <div className="border-t border-slate-800/80 mt-16 pt-8 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-slate-400 font-bold">
          <div>
            © {new Date().getFullYear()} Infovex Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-slate-450" />
            <span>Powered by Infovex Technologies</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
