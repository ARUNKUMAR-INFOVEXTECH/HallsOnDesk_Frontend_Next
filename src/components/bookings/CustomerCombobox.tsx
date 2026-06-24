'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, User, Phone, Mail, Plus, X, Loader2 } from 'lucide-react';
import { useCustomersQuery, useCreateCustomerMutation } from '@/hooks/useCustomerQueries';
import { Customer } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface CustomerComboboxProps {
  selectedCustomerId: string;
  onSelect: (customer: Customer | null) => void;
  error?: string;
}

export function CustomerCombobox({ selectedCustomerId, onSelect, error }: CustomerComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Inline Customer Creation Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [newCustomerNotes, setNewCustomerNotes] = useState('');

  const createCustomerMutation = useCreateCustomerMutation();

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch customers from API
  const { data: response, isLoading } = useCustomersQuery({
    search: debouncedSearch,
  });

  const customersList = response?.data || [];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch current selected customer safely
  const selectedCustomer = customersList.find((c) => c.id === selectedCustomerId) || null;

  const handleCreateCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newCustomerPhone) {
      toast.error('Customer Name and Phone number are required.');
      return;
    }
    if (newCustomerPhone.length !== 10 || isNaN(Number(newCustomerPhone))) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      const res = await createCustomerMutation.mutateAsync({
        customer_name: newCustomerName,
        phone: newCustomerPhone,
        email: newCustomerEmail || undefined,
        address: newCustomerAddress || undefined,
        notes: newCustomerNotes || undefined,
      });

      // Select the newly created customer
      onSelect(res.data);

      // Close modal and reset fields
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerEmail('');
      setNewCustomerAddress('');
      setNewCustomerNotes('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Inline customer creation failed:', err);
    }
  };

  return (
    <div className="space-y-3 w-full" ref={dropdownRef}>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
        Select Customer
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-10 px-3 flex items-center justify-between text-sm bg-white border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
            error ? 'border-red-500' : 'border-slate-200 hover:border-slate-350 shadow-sm'
          }`}
        >
          {selectedCustomer ? (
            <span className="text-slate-800 font-semibold">{selectedCustomer.customer_name}</span>
          ) : (
            <span className="text-slate-400 font-medium">Search or select a customer...</span>
          )}
          <ChevronDown className="h-4.5 w-4.5 text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-premium z-20 overflow-hidden animate-fadeIn">
            {/* Search Input bar */}
            <div className="relative p-2 border-b border-slate-100 bg-slate-50/50">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone..."
                className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* List entries */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 text-xs">
              {/* Inline Create Customer Button Option */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowCreateModal(true);
                }}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-primary-lighter text-primary-light font-bold flex items-center gap-2 border-b border-slate-100 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add New Customer Profile...
              </button>

              {isLoading ? (
                <div className="p-4 text-center text-slate-400 font-semibold">Loading customers...</div>
              ) : customersList.length > 0 ? (
                customersList.map((customer) => {
                  const isSelected = customer.id === selectedCustomerId;
                  const initials = (customer.customer_name || 'C')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        onSelect(customer);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between text-left p-2.5 hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-lighter text-primary-light flex items-center justify-center font-bold text-xs shrink-0">
                          {initials}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block">{customer.customer_name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{customer.phone}</span>
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary-light shrink-0" />}
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-slate-400 font-semibold">No customers found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}

      {/* Selected Customer details preview card */}
      {selectedCustomer && (
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold text-slate-600 animate-slideDown shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary-lighter text-primary-light flex items-center justify-center border border-primary-light/10">
              <User className="h-4 w-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block leading-none font-bold uppercase tracking-wider">Customer Name</span>
              <span className="text-slate-800 font-bold block mt-1">{selectedCustomer.customer_name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary-lighter text-primary-light flex items-center justify-center border border-primary-light/10">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block leading-none font-bold uppercase tracking-wider">Phone Number</span>
              <span className="text-slate-800 font-bold block mt-1 font-mono">{selectedCustomer.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-7 w-7 rounded-lg bg-primary-lighter text-primary-light flex items-center justify-center border border-primary-light/10">
              <Mail className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <span className="text-slate-400 text-[10px] block leading-none font-bold uppercase tracking-wider">Email Address</span>
              <span className="text-slate-800 font-bold block mt-1 truncate">{selectedCustomer.email || 'No email registered'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Inline Create Customer Modal overlay */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-md bg-white rounded-xl shadow-premium border border-slate-200 overflow-hidden z-10 flex flex-col text-xs font-semibold text-slate-700"
            >
              {/* Header Accent color */}
              <div className="h-1 bg-[#159DFC]" />

              {/* Header */}
              <div className="p-5 pb-3 flex justify-between items-start border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 leading-none">
                    <User className="h-4.5 w-4.5 text-primary-light" />
                    Create Customer Profile
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    Quickly register a new customer in the directory registry
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateCustomerSubmit} className="p-5 space-y-4">
                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="inlineCustName" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    id="inlineCustName"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="e.g. Anand Srinivasan"
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-semibold text-slate-700 shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label htmlFor="inlineCustPhone" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      id="inlineCustPhone"
                      required
                      maxLength={10}
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-semibold text-slate-700 shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 w-full">
                    <label htmlFor="inlineCustEmail" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      id="inlineCustEmail"
                      value={newCustomerEmail}
                      onChange={(e) => setNewCustomerEmail(e.target.value)}
                      placeholder="e.g. anand@outlook.com"
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-semibold text-slate-700 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="inlineCustAddress" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Street Address (Optional)
                  </label>
                  <input
                    type="text"
                    id="inlineCustAddress"
                    value={newCustomerAddress}
                    onChange={(e) => setNewCustomerAddress(e.target.value)}
                    placeholder="e.g. 14, Gandhi Nagar Road, Madurai"
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-semibold text-slate-700 shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="inlineCustNotes" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Preferences / Notes (Optional)
                  </label>
                  <textarea
                    id="inlineCustNotes"
                    rows={2}
                    value={newCustomerNotes}
                    onChange={(e) => setNewCustomerNotes(e.target.value)}
                    placeholder="Preferred food styles, guest profile notes..."
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-350 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-750 font-semibold shadow-sm"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-600 transition-colors shadow-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createCustomerMutation.isPending}
                    className="flex items-center justify-center gap-1.5 py-2 px-5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {createCustomerMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        Saving...
                      </>
                    ) : (
                      'Save Customer'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
