'use client';

import React from 'react';
import Link from 'next/link';
import { useHallProfile } from '@/hooks/useSettings';
import { useAuthStore } from '@/store/authStore';
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  User,
  Calendar,
  Users,
  Edit,
  CheckCircle2,
  QrCode,
  ExternalLink,
  FileText,
  Copy,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export default function HallProfilePreviewPage() {
  const { data: profile, isLoading, isError } = useHallProfile();
  const user = useAuthStore((state) => state.user);

  const canEdit = user?.role === 'owner' || user?.role === 'manager';

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-64 bg-gray-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-white border border-gray-100 rounded-xl p-5 md:col-span-2" />
          <div className="h-40 bg-white border border-gray-100 rounded-xl p-5" />
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="bg-white border border-gray-150 rounded-xl p-10 text-center max-w-md mx-auto my-12">
        <Building2 className="h-10 w-10 text-gray-400 mx-auto" />
        <h3 className="font-bold text-gray-800 text-sm mt-3">Profile Data Missing</h3>
        <p className="text-xs text-gray-450 mt-1">We couldn't retrieve the hall profile. Go to settings to set it up.</p>
        {canEdit && (
          <Link
            href="/settings/profile"
            className="mt-4 inline-block px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-750 transition-colors"
          >
            Create Profile Now
          </Link>
        )}
      </div>
    );
  }

  const handleCopyText = (text: string | undefined, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const hasSubsections = profile.hallSections && profile.hallSections.length > 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Cover Image / Hero Area */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-150 shadow-sm bg-gradient-to-r from-slate-900 to-indigo-900 h-64 md:h-80">
        {profile.coverImageUrl ? (
          <img
            src={profile.coverImageUrl}
            alt="Venue cover display"
            className="w-full h-full object-cover opacity-75"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E2E44_1px,transparent_1px),linear-gradient(to_bottom,#1E2E44_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none" />
        )}

        {/* Edit Action Overlay */}
        {canEdit && (
          <Link
            href="/settings/profile"
            className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-2 bg-black/60 backdrop-blur-md hover:bg-black/80 text-white text-[10px] font-bold rounded-lg border border-white/20 transition-all select-none"
          >
            <Edit className="h-3.5 w-3.5 text-[#EE9B00]" />
            <span>Edit Profile</span>
          </Link>
        )}

        {/* Profile Info Overlay at bottom */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-6 pt-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-white border border-gray-250 p-1 shrink-0 shadow-lg flex items-center justify-center overflow-hidden">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="h-8 w-8 text-slate-400" />
              )}
            </div>
            
            <div className="space-y-0.5 text-white">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">{profile.hallName}</h1>
              {profile.ownerName && (
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <User className="h-3.5 w-3.5 text-[#EE9B00]" />
                  <span>Managed by {profile.ownerName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3">
            {profile.establishedYear && (
              <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                <Calendar className="h-3.5 w-3.5 text-[#EE9B00]" />
                <span>Est. {profile.establishedYear}</span>
              </div>
            )}
            {profile.totalCapacity && (
              <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                <Users className="h-3.5 w-3.5 text-[#EE9B00]" />
                <span>Capacity {profile.totalCapacity} Max</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Description, Sub-sections) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About / Description */}
          {profile.description && (
            <div className="bg-white border border-gray-150 rounded-2xl shadow-sm p-6 space-y-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-violet-650" />
                <span>About our Venue</span>
              </h2>
              <p className="text-xs leading-relaxed text-gray-600 font-semibold whitespace-pre-line">
                {profile.description}
              </p>
            </div>
          )}

          {/* Subsections Grid */}
          <div className="bg-white border border-gray-150 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="space-y-0.5">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-violet-650" />
                <span>Venue Spaces & Sub-sections</span>
              </h2>
              <p className="text-[10px] text-gray-450 font-medium">Independent occupancy rooms and dining spaces linked inside this hall profile.</p>
            </div>

            {hasSubsections ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.hallSections.map((section: any) => (
                  <div key={section.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between gap-3 transition-all hover:border-violet-200">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-gray-900 text-xs truncate">{section.name}</span>
                        {section.isActive !== false ? (
                          <span className="text-[8px] font-extrabold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                            ONLINE
                          </span>
                        ) : (
                          <span className="text-[8px] font-extrabold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                            OFFLINE
                          </span>
                        )}
                      </div>
                      {section.description && (
                        <p className="text-[10px] text-gray-450 line-clamp-2 leading-relaxed font-medium">{section.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-700">
                      <Users className="h-3.5 w-3.5 text-[#EE9B00]" />
                      <span className="font-bold text-[10px] text-gray-700">Accommodates up to {section.capacity} guests</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center border border-dashed border-gray-200 rounded-xl">
                <Building2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <span className="text-xs text-gray-400 block font-semibold">No separate halls or dining rooms added</span>
                <p className="text-[10px] text-gray-450 mt-0.5 font-medium">Edit profile settings to partition your venue space.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Columns (Contacts, Legal info) */}
        <div className="space-y-6">
          
          {/* Quick Contacts */}
          <div className="bg-white border border-gray-150 rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Contact Information
            </h2>
            <div className="space-y-3.5">
              {/* Phone */}
              <div className="flex items-start gap-3 text-xs">
                <Phone className="h-4.5 w-4.5 text-gray-450 shrink-0 mt-0.5" />
                <div className="space-y-0.5 overflow-hidden">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Phone Contacts</span>
                  <div className="font-bold text-gray-850">
                    <div>{profile.phone}</div>
                    {profile.alternatePhone && <div className="text-gray-500 text-[10px] mt-0.5 font-medium">{profile.alternatePhone} (Alternate)</div>}
                  </div>
                </div>
              </div>

              {/* Email */}
              {profile.email && (
                <div className="flex items-start gap-3 text-xs">
                  <Mail className="h-4.5 w-4.5 text-gray-450 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 overflow-hidden">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</span>
                    <a href={`mailto:${profile.email}`} className="font-bold text-violet-650 hover:underline truncate block">
                      {profile.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Website */}
              {profile.website && (
                <div className="flex items-start gap-3 text-xs">
                  <Globe className="h-4.5 w-4.5 text-gray-450 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 overflow-hidden">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Official Website</span>
                    <a
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-violet-650 hover:underline flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{profile.website}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                </div>
              )}

              {/* Physical Location */}
              <div className="flex items-start gap-3 text-xs pt-2 border-t border-gray-100">
                <MapPin className="h-4.5 w-4.5 text-gray-450 shrink-0 mt-0.5" />
                <div className="space-y-1 overflow-hidden">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Address Details</span>
                  <span className="font-medium text-gray-650 leading-relaxed block text-[11px] whitespace-pre-line">
                    {profile.address}
                  </span>
                  <span className="font-bold text-gray-800 block">
                    {profile.city}, {profile.state} - {profile.pincode}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal / Billing Identifiers */}
          <div className="bg-white border border-gray-150 rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Legal & Billing Identifiers
            </h2>
            <div className="space-y-4">
              {/* GSTIN */}
              {profile.gstNumber && (
                <div className="p-3 bg-gray-50/50 border border-gray-100 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 overflow-hidden">
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">GSTIN Identification</span>
                    <span className="font-mono font-bold text-gray-800 uppercase tracking-wider truncate block">{profile.gstNumber}</span>
                  </div>
                  <button
                    onClick={() => handleCopyText(profile.gstNumber, 'GSTIN')}
                    className="p-1.5 hover:bg-gray-150 text-gray-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* PAN */}
              {profile.panNumber && (
                <div className="p-3 bg-gray-50/50 border border-gray-100 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 overflow-hidden">
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Permanent Account Number (PAN)</span>
                    <span className="font-mono font-bold text-gray-800 uppercase tracking-wider truncate block">{profile.panNumber}</span>
                  </div>
                  <button
                    onClick={() => handleCopyText(profile.panNumber, 'PAN')}
                    className="p-1.5 hover:bg-gray-150 text-gray-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* UPI and QR mockup */}
              {profile.upiId && (
                <div className="p-4 border border-violet-100 bg-violet-50/20 rounded-xl text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="h-24 w-24 bg-white border border-violet-100/50 rounded-lg shadow-sm flex items-center justify-center p-1.5">
                      <QrCode className="h-full w-full text-violet-650" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-violet-650 uppercase tracking-wider block">Direct UPI Payments ID</span>
                    <span className="font-mono text-[10px] text-slate-650 block truncate font-bold">{profile.upiId}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
