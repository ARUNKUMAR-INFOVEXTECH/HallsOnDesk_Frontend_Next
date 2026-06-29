'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useNotificationStore } from '@/store/notificationStore';
import * as notificationService from '@/services/api/modules/notification.service';
import { Menu, Bell, LogOut, User, ChevronRight, Check, Search, RotateCw } from 'lucide-react';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function Topbar() {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching();

  const handleSync = async () => {
    try {
      // Invalidate all query caches to force refetching of active screen queries
      await queryClient.invalidateQueries();
      toast.success('Database records synced successfully', {
        description: 'All dashboard panels and views have been updated in real-time.'
      });
    } catch (err) {
      toast.error('Sync failed. Please try again.');
    }
  };

  const pathname = usePathname();
  const { toggleSidebar } = useUIStore();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  
  const { notifications, unreadCount, setNotifications, markAsRead: localMarkAsRead, markAllAsRead: localMarkAllAsRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const response = await notificationService.getNotifications({ limit: 50 });
        setNotifications(response.data, response.unread_count);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, setNotifications]);

  const formatNotificationTime = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Today at ${timeStr}`;
    }
    return `${date.toLocaleDateString('en-GB')} at ${timeStr}`;
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      localMarkAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      localMarkAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  // Generate dynamic breadcrumbs based on pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    const isLast = index === pathSegments.length - 1;
    return { href, label, isLast };
  });

  const nameInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <header className="h-14 border-b border-gray-100 bg-white flex items-center justify-between px-6 sticky top-0 z-20 select-none">
      {/* Breadcrumbs / Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-150 text-gray-500 lg:hidden transition-colors"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* Brand identity emblem */}
        <div className="flex items-center gap-1.5 mr-1 shrink-0">
          <img src="/favicon.png" alt="Infovex Halls" className="h-5 w-5 object-contain" />
          <span className="font-black text-[11px] text-[#062089] tracking-tight uppercase">Infovex Halls</span>
          <span className="text-gray-205 font-light text-sm hidden sm:inline">|</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-400">
          <Link href="/dashboard" className="hover:text-primary transition-colors">
            Home
          </Link>
          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.href}>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
              {crumb.isLast ? (
                <span className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-primary transition-colors truncate max-w-[200px]"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-3.5">
        {/* Search Mock Interface */}
        <button
          onClick={() => alert('Search feature simulation - Click to search...')}
          className="p-1.5 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-650 transition-colors cursor-pointer"
        >
          <Search className="h-4.5 w-4.5" />
        </button>

        {/* Real-time sync reload button */}
        <button
          onClick={handleSync}
          disabled={isFetching > 0}
          title="Sync latest database records"
          className="p-1.5 rounded-full hover:bg-gray-50 text-gray-400 hover:text-[#159DFC] hover:bg-[#159DFC]/5 transition-all cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-50"
        >
          <RotateCw className={`h-4.5 w-4.5 transition-transform ${isFetching > 0 ? 'animate-spin text-[#159DFC]' : ''}`} />
        </button>

        {/* Notifications Center */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-1.5 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-650 relative transition-colors cursor-pointer"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-[#EF4444] rounded-full animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 text-xs text-gray-600 animate-fadeIn">
              <div className="px-4 py-2 font-bold text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-50 flex items-center justify-between mb-1">
                <span>Alerts & Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[#159DFC] hover:text-[#002499] hover:underline font-bold lowercase first-letter:uppercase"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 transition-colors ${!notif.is_read ? 'bg-gray-50/50' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="font-semibold text-gray-800 text-xs leading-snug">
                          {notif.title}
                        </span>
                        {!notif.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="p-0.5 rounded text-gray-400 hover:text-green-500 hover:bg-green-50 transition-colors"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-500 text-[11px] leading-relaxed mb-1.5 font-medium">
                        {notif.message}
                      </p>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                        {formatNotificationTime(notif.created_at)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-400 font-medium">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu Avatar Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center justify-center h-8 w-8 rounded-full btn-primary-grad text-white text-xs font-bold transition-all shadow-sm border border-[#159DFC] cursor-pointer"
          >
            {nameInitials}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 text-xs text-gray-600 animate-fadeIn">
              <div className="px-4 py-3 border-b border-gray-50 font-semibold">
                <div className="text-gray-800 leading-tight">{user?.name || 'User'}</div>
                <div className="text-[10px] text-gray-400 font-mono mt-1.5 truncate">{user?.email}</div>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 hover:bg-red-50 hover:text-[#EF4444] transition-colors font-bold text-gray-600 mt-1"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
