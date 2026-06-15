'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuthStore } from '@/store/authStore';
import { AlertCircle } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isSuspended = user?.status === 'suspended';

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      {/* Dynamic App Navigation Sidebar */}
      <div className={isSuspended ? 'filter blur-[5px] pointer-events-none select-none h-full' : 'h-full'}>
        <Sidebar />
      </div>

      {/* Main Action Workspace Container */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isSuspended ? 'filter blur-[5px] pointer-events-none select-none' : ''}`}>
        {/* Topbar headers */}
        <Topbar />

        {/* Scrollable Action Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-[1600px] w-full mx-auto flex flex-col justify-between">
          <div className="flex-1">
            {children}
          </div>
          <footer className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <div>
              © {new Date().getFullYear()} Infovex Halls. All rights reserved.
            </div>
            <div className="text-gray-400/80 hover:text-gray-500 transition-colors">
              Powered by Infovex Technologies Private Limited
            </div>
          </footer>
        </main>
      </div>

      {/* Account Suspended Overlay Modal */}
      {isSuspended && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center border border-red-200 mx-auto shadow-sm">
              <AlertCircle className="h-8 w-8 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Access Restricted</h3>
              <p className="text-xs text-red-600 font-bold bg-red-50 border border-red-100 rounded-lg py-1.5 px-3">
                Account Suspended
              </p>
              <p className="text-xs text-gray-500 font-medium leading-relaxed pt-2 font-sans">
                Your operator login profile has been suspended by the hall administrator. 
                System database and feature access is restricted. Please contact your administrator to reactivate your credentials.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-50">
              <button
                onClick={() => useAuthStore.getState().logout()}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Sign Out / Exit System
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
