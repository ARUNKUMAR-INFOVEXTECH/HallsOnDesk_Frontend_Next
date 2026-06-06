'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      quote: 'We used to write dates in register books, and once we had a double booking conflict for a wedding. It was embarrassing. Since adopting HallsOnDesk, our calendar is clean, and we can check booking slot details directly from our phones.',
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
    <section className="py-24 bg-[#FAFAFA] border-b border-gray-150" id="testimonials">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
          <span className="text-[10px] font-bold text-primary-light uppercase tracking-widest block">
            Customer Success Stories
          </span>
          <h2 className="text-3xl font-bold text-primary tracking-tight">
            Loved By Marriage Hall Operators
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Hear how venue owners and convention center managers across Tamil Nadu are digitizing their wedding seasons.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col justify-between hover:border-slate-350 transition-all duration-200"
            >
              <div>
                {/* Stars */}
                <div className="flex gap-0.5 mb-5 text-amber-500">
                  {[...Array(test.stars)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current shrink-0" />
                  ))}
                </div>

                {/* Quote Quote Graphic */}
                <div className="relative">
                  <Quote className="h-6 w-6 text-primary-light/10 absolute -top-3 -left-3 pointer-events-none -z-10" />
                  <p className="text-xs text-slate-550 font-semibold leading-relaxed italic relative z-10">
                    "{test.quote}"
                  </p>
                </div>
              </div>

              {/* Author metadata */}
              <div className="pt-6 border-t border-slate-100 flex items-center gap-3.5 mt-8">
                <div className="h-8 w-8 rounded-full bg-primary-lighter border border-primary-light/10 text-primary-light flex items-center justify-center font-bold text-xs shrink-0 uppercase shadow-sm">
                  {test.author.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs block leading-none">{test.author}</span>
                  <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">
                    {test.role} • <span className="text-primary-light font-bold">{test.location}</span>
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
