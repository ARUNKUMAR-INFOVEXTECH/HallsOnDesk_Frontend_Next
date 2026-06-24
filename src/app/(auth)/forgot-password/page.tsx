'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Building, Users } from 'lucide-react';
import AuthCard from '@/components/auth/AuthCard';

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Recover Your Password"
      subtitle="Follow the guidelines below to retrieve your operator credentials."
    >
      <div className="space-y-6">
        {/* Guidelines List */}
        <div className="space-y-4 text-left">
          
          {/* Owner Guide */}
          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-start gap-3 shadow-custom-sm">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#062089] shrink-0 mt-0.5">
              <Building className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider leading-none">
                Marriage Hall Owners
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                If you are the primary administrator/owner of a marriage hall, please contact the 
                <span className="text-indigo-950 font-extrabold"> Infovex Halls Administration</span> to retrieve your login password.
              </p>
            </div>
          </div>

          {/* Staff Guide */}
          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-start gap-3 shadow-custom-sm">
            <div className="h-8 w-8 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              <Users className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider leading-none">
                Staff, Managers & Operators
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                If you are a manager, clerk, receptionist, or staff operator, please reach out directly to your 
                <span className="text-slate-700 font-extrabold"> Marriage Hall Owner</span>. They can safely look up and display your credentials inside their staff directory dashboard.
              </p>
            </div>
          </div>

        </div>

        {/* Back to Login Button */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-lg text-xs font-extrabold text-slate-700 border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors shadow-custom-sm cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Sign In
          </Link>
        </div>

      </div>
    </AuthCard>
  );
}
