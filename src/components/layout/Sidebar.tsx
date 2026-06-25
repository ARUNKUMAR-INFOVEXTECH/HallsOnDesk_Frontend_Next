'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { DASHBOARD_NAV_ITEMS, ADMIN_NAV_ITEMS } from '@/constants';
import { X, LogOut } from 'lucide-react';
import { useDashboardQuery } from '@/hooks/useDashboardQueries';
import HallSwitcher from './HallSwitcher';
import { hasFeature } from '@/utils/subscription';

// Dynamic Icon rendering utility
function SidebarIcon({ name, className = 'h-4 w-4' }: { name: string; className?: string }) {
  const Icon = (Icons as any)[name];
  if (!Icon) return <Icons.HelpCircle className={className} />;
  return <Icon className={className} />;
}

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const { data: dashboardData } = useDashboardQuery();
  const activeSubscription = dashboardData?.subscription;
  const isSubExpired = role !== 'super_admin' && dashboardData && (!activeSubscription || (activeSubscription.status !== 'active' && activeSubscription.status !== 'trial'));

  if (!user) return null;

  // Filter navigation items by active user role
  let allowedNavItems = DASHBOARD_NAV_ITEMS.filter((item) =>
    role ? item.roles.includes(role as any) : false
  );

  // Filter based on active subscription package capabilities
  if (role !== 'super_admin' && activeSubscription) {
    allowedNavItems = allowedNavItems.filter((item) => {
      if (item.href === '/dashboard/enquiries') {
        return hasFeature(activeSubscription, 'crm');
      }
      if (item.href === '/dashboard/vendors') {
        return hasFeature(activeSubscription, 'vendors');
      }
      if (item.href === '/dashboard/support') {
        return hasFeature(activeSubscription, 'support');
      }
      return true;
    });
  }

  if (isSubExpired) {
    allowedNavItems = allowedNavItems.filter((item) => item.href === '/dashboard' || item.href === '/dashboard/settings' || item.href === '/dashboard/support' || item.href === '/dashboard/invoices');
  }

  const allowedAdminItems = ADMIN_NAV_ITEMS.filter((item) =>
    role ? item.roles.includes(role as any) : false
  );

  return (
    <>
      {/* Background Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 border-r border-blue-900/50 bg-[#062089] z-40 transition-transform duration-250 ease-in-out lg:translate-x-0 lg:static lg:h-full h-full flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header: Logo Branding */}
        <div className="px-5 py-5 border-b border-blue-900/50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm border border-white/20 hover:bg-slate-50 transition-all duration-150 shrink-0">
              <img src="/logo.png" alt="Infovex Halls Logo" className="h-6.5 w-auto object-contain" />
            </Link>
            
            {/* Close Sidebar button on mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Hall Switcher Dropdown */}
          <HallSwitcher />
        </div>

        {/* Scrollable Navigation Area */}
        <nav className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-6">
          {/* Main User Navigation Links */}
          {allowedNavItems.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-3 py-1 text-[10px] font-bold text-blue-200/50 uppercase tracking-wider mb-2">
                Venue Workspace
              </div>
              {allowedNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#159DFC] to-[#6025BC] text-white font-semibold shadow-md'
                        : 'text-blue-100/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <SidebarIcon name={item.icon} className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-blue-200/70'}`} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Superadmin Console Link */}
          {allowedAdminItems.length > 0 && (
            <div className="space-y-1.5 mt-6">
              <div className="px-3 py-1 text-[10px] font-bold text-blue-200/50 uppercase tracking-wider mb-2">
                System Admin Panel
              </div>
              {allowedAdminItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#159DFC] to-[#6025BC] text-white font-semibold shadow-md'
                        : 'text-blue-100/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <SidebarIcon name={item.icon} className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-blue-200/70'}`} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Footer: User profile info & logout */}
        <div className="p-4 border-t border-blue-900/50 bg-blue-950/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8.5 w-8.5 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-white/20">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs text-white truncate leading-snug">
                {user?.name || user?.email || 'User'}
              </div>
              <div className="text-[10px] text-blue-200/70 truncate capitalize mt-0.5 font-medium">
                {role?.replace('_', ' ') || 'Member'}
              </div>
            </div>
          </div>
          
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-blue-200/80 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
