import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SettingsSidebar from '@/components/settings/SettingsSidebar';

export const metadata = {
  title: 'Settings - HallsOnDesk',
  description: 'Manage venue profiles, tax configurations, and system settings.',
};

export default function SettingsRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-[1400px] mx-auto pb-16">
        {/* Internal settings navigation sidebar */}
        <SettingsSidebar />

        {/* Dynamic sub-page container */}
        <div className="flex-1 w-full min-w-0">
          {children}
        </div>
      </div>
    </DashboardLayout>
  );
}
