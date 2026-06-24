'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  CreditCard, 
  Inbox, 
  LifeBuoy, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Check, 
  Activity, 
  Plus, 
  PhoneCall, 
  ShieldCheck, 
  TrendingUp,
  ChevronDown
} from 'lucide-react';

export default function DashboardMockup() {
  const navItems = [
    { title: 'Dashboard', icon: <LayoutDashboard className="h-3.5 w-3.5" />, active: true },
    { title: 'Bookings', icon: <CalendarDays className="h-3.5 w-3.5" />, active: false },
    { title: 'Calendar', icon: <CalendarDays className="h-3.5 w-3.5" />, active: false },
    { title: 'Customers', icon: <Users className="h-3.5 w-3.5" />, active: false },
    { title: 'Payments', icon: <CreditCard className="h-3.5 w-3.5" />, active: false },
    { title: 'Enquiries', icon: <Inbox className="h-3.5 w-3.5" />, active: false },
    { title: 'Support Center', icon: <LifeBuoy className="h-3.5 w-3.5" />, active: false },
  ];

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-1 md:p-2 overflow-hidden select-none text-left">
      {/* Mock Browser Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-900 bg-slate-950 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          <span className="text-slate-500 ml-2 font-semibold font-mono">dashboard.infovexhalls.in</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-bold bg-slate-900 px-3 py-0.5 rounded-md border border-slate-800/80">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>SSL Secured Sync</span>
        </div>
      </div>

      {/* Main Dashboard Layout Shell */}
      <div className="flex h-[420px] md:h-[500px] bg-[#F8FAFC] overflow-hidden">
        
        {/* 1. Left Sidebar Mockup (Deep Royal Blue bg-[#062089]) */}
        <aside className="hidden md:flex flex-col w-44 bg-[#062089] border-r border-blue-900/50 text-blue-100/70 shrink-0">
          {/* Logo Section */}
          <div className="p-3.5 border-b border-blue-900/50 space-y-3">
            <div className="flex items-center bg-white px-2.5 py-1 rounded-md border border-white/20 shadow-sm shrink-0">
              <img src="/logo.png" alt="Infovex Halls Logo" className="h-5 w-auto object-contain" />
            </div>
            {/* Venue switcher mimic */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-blue-950/60 border border-blue-900/50 rounded-lg text-[9px] font-bold text-slate-300">
              <span className="truncate">Raj Mahal Palace</span>
              <ChevronDown className="h-3 w-3 text-slate-500 shrink-0" />
            </div>
          </div>

          {/* Navigation links mimic */}
          <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
            <div className="space-y-1">
              <span className="px-2.5 text-[7px] font-black text-blue-200/50 uppercase tracking-widest block mb-1">
                Venue Workspace
              </span>
              {navItems.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[9.5px] cursor-pointer transition-all ${
                    item.active
                      ? 'bg-gradient-to-r from-[#159DFC] to-[#6025BC] text-white font-bold shadow-sm'
                      : 'hover:bg-white/10 text-blue-100/70 hover:text-white'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </nav>

          {/* User footer profile mimic */}
          <div className="p-3 border-t border-blue-900/50 bg-blue-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-6.5 w-6.5 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-[9px] shrink-0 border border-white/20">
                S
              </div>
              <div className="overflow-hidden leading-none">
                <span className="font-bold text-[9px] text-white block truncate">Suresh Kumar</span>
                <span className="text-[7.5px] text-blue-200/70 block truncate mt-0.5 capitalize">Owner</span>
              </div>
            </div>
            <LogOut className="h-3.5 w-3.5 text-blue-200/80 hover:text-red-400 cursor-pointer" />
          </div>
        </aside>

        {/* 2. Right Canvas Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Topbar Mockup */}
          <header className="h-10 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-650">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Raj Mahal Palace</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400 font-semibold font-mono">Consolidated Workspace</span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search bar mimic */}
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[9px] text-slate-400">
                <Search className="h-3 w-3" />
                <span>Search bookings...</span>
              </div>
              <div className="relative">
                <Bell className="h-4 w-4 text-slate-400 cursor-pointer" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#159DFC]" />
              </div>
              <div className="h-6 w-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-[9px] text-[#0F172A]">
                S
              </div>
            </div>
          </header>

          {/* Main scrollable body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* KPI Cards Row (Exactly like real dashboard stats) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wider">Total Bookings</span>
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-[#0F172A] font-mono">32</span>
                  <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100">+12% MoM</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wider">Monthly Revenue</span>
                  <CreditCard className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-[#0F172A] font-mono">₹1,84,500</span>
                  <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100">+8.4%</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wider">Active Enquiries</span>
                  <Inbox className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-[#0F172A] font-mono">8 leads</span>
                  <span className="text-[8.5px] text-slate-400 font-semibold font-sans">In progress</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wider">Pending Balance</span>
                  <Users className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-[#0F172A] font-mono">₹45,200</span>
                  <span className="text-[8px] font-bold text-red-500 bg-red-50 px-1 py-0.2 rounded border border-red-100">-4.2%</span>
                </div>
              </div>
            </div>

            {/* Performance Aggregators strip */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-wrap gap-x-8 gap-y-2 text-[9.5px] text-slate-500 font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Conversion Rate: <span className="text-slate-800 font-extrabold">42%</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6025BC]" />
                <span>Avg. Order Value: <span className="text-slate-800 font-extrabold">₹72,000</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>Collection Rate: <span className="text-slate-800 font-extrabold">86%</span></span>
              </div>
            </div>

            {/* Two Column details row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Column: Schedules Table (lg:col-span-7) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="px-4.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">Upcoming Marriage Schedules</span>
                  <span className="text-[8.5px] font-bold text-[#159DFC] hover:underline cursor-pointer">Calendar Log</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-[9px] font-medium text-slate-600">
                    <thead className="bg-[#F8FAFC] text-[8px] font-bold uppercase tracking-wider border-b border-slate-200 text-slate-400 h-8">
                      <tr>
                        <th className="px-4">Date</th>
                        <th className="px-4">Event Name</th>
                        <th className="px-4">Client</th>
                        <th className="px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="h-9">
                        <td className="px-4 text-[#0F172A] font-bold">12 Jun 2026</td>
                        <td className="px-4 text-slate-800 font-extrabold">Rajesh Weds Swetha</td>
                        <td className="px-4 text-slate-500">Anand Kumar</td>
                        <td className="px-4 text-right">
                          <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[8px] uppercase tracking-wider">Confirmed</span>
                        </td>
                      </tr>
                      <tr className="h-9">
                        <td className="px-4 text-[#0F172A] font-bold">18 Jun 2026</td>
                        <td className="px-4 text-slate-800 font-extrabold">Priya Weds Karthik</td>
                        <td className="px-4 text-slate-500">Suresh P.</td>
                        <td className="px-4 text-right">
                          <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-600 border border-amber-100 font-bold text-[8px] uppercase tracking-wider">Pending</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="h-2" />
              </div>

              {/* Right Column: Checklist & Activity Logs (lg:col-span-5) */}
              <div className="lg:col-span-5 grid grid-cols-1 gap-4">
                {/* Daily checklist */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9.5px] font-extrabold text-slate-700 uppercase tracking-wider">Daily Checklist</span>
                    <span className="text-[7.5px] font-bold text-slate-450 bg-[#F8FAFC] border border-slate-200 px-1.5 rounded-full">2/3 done</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[9px] text-slate-500">
                      <div className="h-3.5 w-3.5 rounded bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span className="line-through text-slate-400 font-semibold truncate">Confirm decorator arrival time</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-500">
                      <div className="h-3.5 w-3.5 rounded bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span className="line-through text-slate-400 font-semibold truncate">Cross-check client UPI advance receipt</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-500">
                      <div className="h-3.5 w-3.5 rounded bg-white border border-slate-300 shrink-0" />
                      <span className="text-slate-700 font-bold truncate">Verify wedding catering details</span>
                    </div>
                  </div>
                </div>

                {/* Operations log activity */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-3 text-[9.5px] font-extrabold text-slate-700 uppercase tracking-wider">
                    <span>Recent Operations Log</span>
                    <Activity className="h-3.5 w-3.5 text-[#6025BC] shrink-0" />
                  </div>
                  
                  <div className="relative pl-2.5 border-l border-slate-200 space-y-2.5 ml-1 text-[8.5px]">
                    <div className="relative leading-tight">
                      <div className="absolute -left-[13.5px] h-1.5 w-1.5 rounded-full bg-[#6025BC] border border-white mt-0.5" />
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>Booking Confirmed</span>
                        <span className="text-slate-400 font-mono">2 min ago</span>
                      </div>
                      <p className="text-[7.5px] text-slate-450 mt-0.5">Rajesh Weds Swetha locked for 12/06/2026</p>
                    </div>
                    
                    <div className="relative leading-tight">
                      <div className="absolute -left-[13.5px] h-1.5 w-1.5 rounded-full bg-[#6025BC] border border-white mt-0.5" />
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>Payment Logged</span>
                        <span className="text-slate-400 font-mono">1 hr ago</span>
                      </div>
                      <p className="text-[7.5px] text-slate-450 mt-0.5">₹25,000 advance registered for Rajesh Weds Swetha</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
