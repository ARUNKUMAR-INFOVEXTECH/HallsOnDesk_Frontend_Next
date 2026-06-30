'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, Settings, AlertTriangle, ExternalLink, CreditCard, Lock, Layers } from 'lucide-react';
import { useDashboardQuery } from '@/hooks/useDashboardQueries';

export default function SettingsSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: dashboardData } = useDashboardQuery();
  const activeSubscription = dashboardData?.subscription;
  const isSubExpired = dashboardData && (!activeSubscription || (activeSubscription.status !== 'active' && activeSubscription.status !== 'trial'));

  React.useEffect(() => {
    if (isSubExpired && pathname !== '/settings/subscription') {
      router.replace('/settings/subscription');
    }
  }, [isSubExpired, pathname, router]);

  let navItems = [
    { title: 'Hall Profile', href: '/settings/profile', icon: Building2 },
    { title: 'Multi-Hall Management', href: '/settings/halls', icon: Layers },
    { title: 'General Settings', href: '/settings/general', icon: Settings },
    { title: 'Security Settings', href: '/settings/security', icon: Lock },
    { title: 'Subscription & Plan', href: '/settings/subscription', icon: CreditCard },
  ];

  if (isSubExpired) {
    navItems = [
      { title: 'Subscription & Plan', href: '/settings/subscription', icon: CreditCard },
    ];
  }

  return (
    <aside className="w-64 bg-white rounded-xl border border-gray-150 shadow-sm p-4 sticky top-6 self-start space-y-6 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Venue Configurations
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-violet-50 text-violet-750 border-l-2 border-violet-600 rounded-l-none font-bold'
                    : 'text-gray-600 hover:bg-gray-50/70 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-violet-650' : 'text-gray-450'}`} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-gray-100 space-y-3.5">
        <div className="px-3 flex items-center gap-1.5 text-[10px] font-bold text-gray-450 uppercase">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          <span>Danger Zone</span>
        </div>
        
        <Link
          href="mailto:support@infovex.com"
          target="_blank"
          className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-gray-550 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-gray-400" />
            <span>Need Help?</span>
          </span>
          <span className="text-[10px] text-gray-400 font-medium font-sans">Contact Support</span>
        </Link>
      </div>
    </aside>
  );
}
