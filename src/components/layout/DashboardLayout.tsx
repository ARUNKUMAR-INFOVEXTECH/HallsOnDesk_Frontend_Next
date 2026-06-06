'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      {/* Dynamic App Navigation Sidebar */}
      <Sidebar />

      {/* Main Action Workspace Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar headers */}
        <Topbar />

        {/* Scrollable Action Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
