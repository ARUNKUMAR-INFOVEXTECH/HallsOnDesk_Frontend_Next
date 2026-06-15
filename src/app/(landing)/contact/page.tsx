'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Globe, Clock, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    hallName: '',
    city: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      toast.error('Please fill in your Name, Phone Number, and Message.');
      return;
    }

    setIsSubmitting(true);
    // Simulate API Submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Thank you! Your message has been sent to Infovex Technologies. We will get back to you shortly.');
      setFormData({
        name: '',
        phone: '',
        email: '',
        hallName: '',
        city: '',
        message: '',
      });
    }, 1200);
  };

  return (
    <div className="bg-[#F8FAFC] pt-24 min-h-screen">
      {/* Page Header */}
      <div className="py-16 bg-white border-b border-slate-200/80 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#EE9B00]/10 border border-[#EE9B00]/25 rounded-full text-[10px] font-bold text-[#D48A00] uppercase tracking-widest backdrop-blur-sm shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#EE9B00]" />
            Connect With Us
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0A2540] tracking-tight">
            Contact Infovex Technologies
          </h1>
          <p className="text-xs sm:text-sm text-slate-550 max-w-xl mx-auto leading-relaxed font-semibold">
            Have questions about digitizing your mandapam operations? Get in touch with our product support and onboarding teams directly.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Side: Contact Information Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-md space-y-6">
              <h2 className="text-lg font-extrabold text-[#0A2540] border-b border-slate-100 pb-4">
                Corporate Office
              </h2>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-[#EE9B00] shadow-sm">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">Company Website</span>
                    <a 
                      href="https://infovextech.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-bold text-slate-700 hover:text-[#EE9B00] block mt-1.5 transition-colors"
                    >
                      infovextech.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-[#EE9B00] shadow-sm">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">Email Address</span>
                    <a 
                      href="mailto:info@infovex.in" 
                      className="text-xs font-bold text-slate-700 hover:text-[#EE9B00] block mt-1.5 transition-colors"
                    >
                      info@infovex.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-[#EE9B00] shadow-sm">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">Contact Number</span>
                    <a 
                      href="tel:+919876543210" 
                      className="text-xs font-bold text-slate-700 hover:text-[#EE9B00] block mt-1.5 transition-colors"
                    >
                      +91 98765 43210
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-[#EE9B00] shadow-sm">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">Office Address</span>
                    <span className="text-xs font-bold text-slate-700 block mt-1.5 leading-relaxed">
                      Infovex Technologies, Chennai, Tamil Nadu, India
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-[#EE9B00] shadow-sm">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">Working Hours</span>
                    <span className="text-xs font-bold text-slate-700 block mt-1.5">
                      Monday – Saturday, 9:00 AM – 6:00 PM (IST)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#EE9B00]/5 border border-[#EE9B00]/25 rounded-3xl p-6.5">
              <span className="text-[10px] font-extrabold text-[#D48A00] uppercase tracking-widest block mb-2">
                Onboarding SLA
              </span>
              <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                Our support desk reviews all queries within 2 hours. Approved Founding Hall partners receive direct access to our priority WhatsApp hotline for instant technical training and data import requests.
              </p>
            </div>
          </div>

          {/* Right Side: Contact Form Card */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-lg space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-extrabold text-[#0A2540]">
                  Send Message
                </h2>
                <p className="text-xs text-slate-450 mt-1 font-semibold">
                  Fill in the details below to request a call back or seek product assistance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-[10px] text-slate-450 font-extrabold uppercase tracking-wider mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#EE9B00]/70 font-semibold"
                    placeholder="Enter name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-[10px] text-slate-450 font-extrabold uppercase tracking-wider mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#EE9B00]/70 font-semibold"
                    placeholder="Enter contact number"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-[10px] text-slate-450 font-extrabold uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#EE9B00]/70 font-semibold"
                    placeholder="Enter email (optional)"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-[10px] text-slate-450 font-extrabold uppercase tracking-wider mb-2">
                    City / Region
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#EE9B00]/70 font-semibold"
                    placeholder="Enter city name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="hallName" className="block text-[10px] text-slate-450 font-extrabold uppercase tracking-wider mb-2">
                  Marriage Hall / Mandapam Name
                </label>
                <input
                  type="text"
                  id="hallName"
                  name="hallName"
                  value={formData.hallName}
                  onChange={handleChange}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#EE9B00]/70 font-semibold"
                  placeholder="Enter hall name (optional)"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-[10px] text-slate-450 font-extrabold uppercase tracking-wider mb-2">
                  Message Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#EE9B00]/70 font-semibold resize-none"
                  placeholder="How can we help you digitize your venue operations?"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl text-xs font-extrabold text-white bg-[#0A2540] hover:bg-[#081D33] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01]"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="h-4.5 w-4.5" />
                    <span>Submit Query to Infovex Technologies</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
