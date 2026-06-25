'use client';

import React from 'react';
import {
  Mail,
  MessageSquare,
  MessageCircle,
  CalendarPlus,
  IndianRupee,
  Inbox,
  Bell,
  CheckCircle,
  HelpCircle,
  Lock as LockIcon
} from 'lucide-react';
import { NotificationSettings } from '@/types/settings';

interface NotificationMatrixProps {
  values: NotificationSettings;
  onChange: (updated: Partial<NotificationSettings>) => void;
  emailContact?: string;
  phoneContact?: string;
  isWhatsappPremium?: boolean;
}

export default function NotificationMatrix({
  values,
  onChange,
  emailContact = 'owner@vasanthamahal.com',
  phoneContact = '+91 98401 23456',
  isWhatsappPremium = false,
}: NotificationMatrixProps) {

  const channelsList = [
    {
      key: 'emailEnabled' as const,
      label: 'Email Alerting',
      icon: Mail,
      color: 'text-violet-600 bg-violet-50 border-violet-100',
      meta: emailContact,
    },
    {
      key: 'smsEnabled' as const,
      label: 'SMS Alerting',
      icon: MessageSquare,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      meta: 'Credits: 852 remaining',
    },
    {
      key: 'whatsappEnabled' as const,
      label: 'WhatsApp Alerting',
      icon: MessageCircle,
      color: 'text-green-600 bg-green-50 border-green-100',
      meta: phoneContact,
    },
  ];

  const alertsList = [
    {
      key: 'newBookingAlert' as const,
      title: 'New Booking Received',
      description: 'Notify when a client signs a contract or blocks a venue section.',
      icon: CalendarPlus,
    },
    {
      key: 'paymentReceivedAlert' as const,
      title: 'Payment Received',
      description: 'Alert when advance fees or ledger payments are recorded.',
      icon: IndianRupee,
    },
    {
      key: 'enquiryAlert' as const,
      title: 'New Enquiry Captured',
      description: 'Trigger notification when a new lead registers via landing forms.',
      icon: Inbox,
    },
    {
      key: 'followupReminder' as const,
      title: 'Follow-up Scheduler Warning',
      description: 'Reminders for daily enquiry check-ins and appointments.',
      icon: Bell,
    },
  ];

  const handleToggleChannel = (key: keyof NotificationSettings) => {
    onChange({ [key]: !values[key] });
  };

  const handleToggleAlert = (key: keyof NotificationSettings) => {
    onChange({ [key]: !values[key] });
  };

  return (
    <div className="space-y-6">
      {/* Channels row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {channelsList.map((chan) => {
          const Icon = chan.icon;
          const isLocked = chan.key === 'whatsappEnabled' && !isWhatsappPremium;
          const isEnabled = values[chan.key] && !isLocked;
          return (
            <div
              key={chan.key}
              className={`p-4 border rounded-xl flex items-start justify-between gap-4 bg-white transition-all shadow-sm ${
                isLocked ? 'opacity-70 bg-gray-50/50' : isEnabled ? 'border-violet-200 ring-1 ring-violet-200' : 'border-gray-150'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${isLocked ? 'text-gray-400 bg-gray-100 border-gray-200' : chan.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-gray-950 block">{chan.label}</span>
                    {isLocked && (
                      <span className="text-[7px] font-extrabold text-violet-750 bg-violet-50 border border-violet-100 px-1 rounded uppercase tracking-wide">
                        Lock
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold truncate block mt-0.5">
                    {isLocked ? 'Requires Premium Plan' : chan.meta}
                  </span>
                </div>
              </div>

              {isLocked ? (
                <div className="text-gray-400 p-1 shrink-0" title="Premium Feature Locked">
                  <LockIcon className="h-4 w-4" />
                </div>
              ) : (
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleToggleChannel(chan.key)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-violet-600" />
                </label>
              )}
            </div>
          );
        })}
      </div>

      {/* Alerts Matrix list */}
      <div className="bg-white border border-gray-150 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <span>Operational Notifications Events</span>
          <span>Alert Channels Status</span>
        </div>

        <div className="divide-y divide-gray-100">
          {alertsList.map((alert) => {
            const AlertIcon = alert.icon;
            const isAlertEnabled = values[alert.key];

            return (
              <div key={alert.key} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gray-100 text-gray-500 border border-gray-150 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertIcon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">{alert.title}</span>
                    <p className="text-[10px] text-gray-400 font-semibold leading-relaxed mt-0.5">{alert.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 border-gray-50 pt-2 sm:pt-0 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-450 font-bold sm:hidden">Toggle Alert Event:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAlertEnabled}
                        onChange={() => handleToggleAlert(alert.key)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-violet-650" />
                    </label>
                  </div>
                  
                  {/* Visual Status Indicator Indicators */}
                  <div className="hidden sm:flex items-center gap-2.5">
                    <span className={`h-2 w-2 rounded-full ${isAlertEnabled && values.emailEnabled ? 'bg-violet-600' : 'bg-gray-200'}`} title="Email Channel Status" />
                    <span className={`h-2 w-2 rounded-full ${isAlertEnabled && values.smsEnabled ? 'bg-blue-500' : 'bg-gray-200'}`} title="SMS Channel Status" />
                    <span className={`h-2 w-2 rounded-full ${isAlertEnabled && values.whatsappEnabled ? 'bg-green-500' : 'bg-gray-200'}`} title="WhatsApp Channel Status" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
