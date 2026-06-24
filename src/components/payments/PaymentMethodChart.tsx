'use client';

import React from 'react';
import { usePaymentMethodStats } from '@/hooks/usePayments';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/currency';
import { PaymentMethod } from '@/types/payment';
import { Smartphone, Banknote, Building2, FileText, CreditCard, Coins } from 'lucide-react';

export function PaymentMethodChart() {
  const { data: methodStats = [], isLoading, isError } = usePaymentMethodStats();

  const methodColors: Record<PaymentMethod, string> = {
    cash: '#159DFC',
    upi: '#3B82F6',
    bank_transfer: '#10B981',
    cheque: '#F59E0B',
    card: '#EF4444',
    other: '#6B7280',
  };

  const methodLabels: Record<PaymentMethod, string> = {
    cash: 'Cash',
    upi: 'UPI',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
    card: 'Card',
    other: 'Other',
  };

  const methodIcons: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
    cash: Banknote,
    upi: Smartphone,
    bank_transfer: Building2,
    cheque: FileText,
    card: CreditCard,
    other: Coins,
  };

  const totalCount = methodStats.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex flex-col h-[380px] overflow-hidden select-none">
      
      {/* Header */}
      <div className="border-b border-slate-50 pb-3 shrink-0">
        <h3 className="text-sm font-extrabold text-slate-850">Payment Methods</h3>
        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Distribution of collected revenues</p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-xs font-semibold text-slate-400 animate-pulse">
          Loading payment method distributions...
        </div>
      ) : isError ? (
        <div className="flex-1 flex items-center justify-center text-xs font-semibold text-slate-400">
          Failed to load methods distribution.
        </div>
      ) : methodStats.length > 0 ? (
        <div className="flex-1 flex flex-col justify-between min-h-0 py-2">
          
          {/* Donut Chart Container */}
          <div className="relative h-[150px] w-full shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="method"
                >
                  {methodStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={methodColors[entry.method] || '#6B7280'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
              <span className="text-lg font-extrabold text-slate-800 leading-none mt-0.5">{totalCount} Txns</span>
            </div>
          </div>

          {/* Legend Rows Grid (sorted by amount descending) */}
          <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-50 pr-1 text-xs font-semibold text-slate-600">
            {methodStats.map((item) => {
              const Icon = methodIcons[item.method] || Coins;
              const color = methodColors[item.method] || '#6B7280';
              
              return (
                <div key={item.method} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-800 font-bold">{methodLabels[item.method]}</span>
                    <span className="text-[10px] text-slate-400 font-medium font-mono">({item.count})</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-700 font-mono">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-50 border border-slate-200 text-slate-500 font-mono shadow-sm">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-2">
          <Coins className="h-8 w-8 text-slate-300" />
          <h4 className="text-xs font-extrabold text-slate-700">No data available</h4>
          <p className="text-[10px] text-slate-400">Method ratios appear once payments are recorded.</p>
        </div>
      )}

    </div>
  );
}
