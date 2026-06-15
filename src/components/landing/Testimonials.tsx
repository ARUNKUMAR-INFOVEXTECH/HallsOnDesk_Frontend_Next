'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      quote: 'We used to write dates in register books, and once we had a double booking conflict for a wedding. It was embarrassing. Since adopting Infovex Halls, our calendar is clean, and we can check booking slot details directly from our phones.',
      author: 'Sundaram P.',
      role: 'Owner, Sundar Mahal Palace',
      location: 'Madurai, TN',
      stars: 5,
    },
    {
      quote: 'Tracking customer payments and advance rentals was always chaotic. Decorators, cooks, and cleaning sub-contracts were managed separately. Now we log every receipt instantly. The pending collections alerts feature has saved us lakhs this season alone.',
      author: 'Karthik Raja',
      role: 'Manager, Sri Balaji Thirumana Mandapam',
      location: 'Chennai, TN',
      stars: 5,
    },
    {
      quote: 'Onboarding our manager took less than an day. The system is extremely simple to navigate. Direct support from Infovex Technologies is highly reliable. We highly recommend the Founding Hall Program package.',
      author: 'Selvan Swamy',
      role: 'Proprietor, Swamy Community Hall',
      location: 'Coimbatore, TN',
      stars: 5,
    },
  ];

  return (
    <section className="py-28 bg-white border-b border-slate-200/80 relative overflow-hidden" id="testimonials">
      {/* Background spot glows */}
      <div className="absolute top-1/4 right-0 h-[300px] w-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-[10px] font-bold text-[#D48A00] uppercase tracking-widest block">
            Customer Success Stories
          </span>
          <h2 className="text-3xl font-extrabold text-[#0A2540] tracking-tight">
            Loved By Marriage Hall Operators
          </h2>
          <p className="text-sm text-slate-500 font-semibold leading-relaxed">
            Hear how venue owners and convention center managers across Tamil Nadu are digitizing their wedding seasons.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((test, idx) => (
            <div
              key={idx}
              className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-8 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#EE9B00]/25 transition-all duration-300 relative group overflow-hidden backdrop-blur-sm"
            >
              <div>
                {/* Stars */}
                <div className="flex gap-1 mb-6 text-[#EE9B00]">
                  {[...Array(test.stars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current shrink-0" />
                  ))}
                </div>

                {/* Quote Graphic Overlay */}
                <div className="relative">
                  <Quote className="h-8 w-8 text-[#EE9B00]/8 absolute -top-4 -left-4 pointer-events-none -z-10 group-hover:scale-110 transition-transform duration-350" />
                  <p className="text-xs text-slate-650 font-semibold leading-relaxed italic relative z-10">
                    "{test.quote}"
                  </p>
                </div>
              </div>

              {/* Author metadata */}
              <div className="pt-6 border-t border-slate-200/60 flex items-center gap-3.5 mt-8">
                <div className="h-9 w-9 rounded-full bg-slate-200 border border-slate-300 text-[#0A2540] flex items-center justify-center font-extrabold text-sm shrink-0 uppercase shadow-sm">
                  {test.author.charAt(0)}
                </div>
                <div>
                  <span className="font-extrabold text-[#0A2540] text-xs block leading-none">{test.author}</span>
                  <span className="text-[10px] text-slate-500 block mt-1.5 font-semibold">
                    {test.role} • <span className="text-[#EE9B00] font-bold">{test.location}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
