'use client';

import React, { useState, useEffect } from 'react';
import { useAdminHalls, useAdminGenerateCustomInvoice } from '@/hooks/useAdmin';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  Loader2,
  Building,
  User,
  Calculator,
  Mail,
  Phone,
  MapPin,
  Percent
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/formatters';

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceFormData {
  hallId: string;
  billToName: string;
  billToPhone: string;
  billToEmail: string;
  billToAddress: string;
  invoiceDate: string;
  dueDate: string;
  invoiceNo: string;
  taxEnabled: boolean;
  taxPercentage: number;
  notes: string;
}

export default function AdminInvoicesPage() {
  const { halls = [], isLoading: hallsLoading } = useAdminHalls();
  const generateCustomInvoiceMutation = useAdminGenerateCustomInvoice();

  // Get current date and 7-days-out date
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getFutureDateStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Form State
  const [formData, setFormData] = useState<InvoiceFormData>({
    hallId: '',
    billToName: '',
    billToPhone: '',
    billToEmail: '',
    billToAddress: '',
    invoiceDate: getTodayStr(),
    dueDate: getFutureDateStr(7),
    invoiceNo: '',
    taxEnabled: true,
    taxPercentage: 18,
    notes: 'Thank you for choosing Infovex Halls. Please remit payment by the due date.'
  });

  // Line Items State
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { id: '1', description: 'Setup & Installation Fee', quantity: 1, rate: 4999 }
  ]);

  // Autofill when a hall is selected
  const handleHallChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const hall = halls.find((h) => h.id === selectedId);

    if (hall) {
      setFormData((prev) => ({
        ...prev,
        hallId: selectedId,
        billToName: hall.owner_name || hall.hall_name || '',
        billToPhone: hall.phone || '',
        billToEmail: hall.email || '',
        billToAddress: hall.address || hall.city || ''
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        hallId: '',
        billToName: '',
        billToPhone: '',
        billToEmail: '',
        billToAddress: ''
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'taxPercentage' ? parseFloat(value) || 0 : val
    }));
  };

  // Line Items Operations
  const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === 'quantity' ? parseInt(value) || 0 : field === 'rate' ? parseFloat(value) || 0 : value
      };
      return updated;
    });
  };

  const addLineItem = () => {
    const newId = (lineItems.length + 1).toString();
    setLineItems((prev) => [
      ...prev,
      { id: newId, description: '', quantity: 1, rate: 0 }
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = formData.taxEnabled ? subtotal * (formData.taxPercentage / 100) : 0;
  const grandTotal = subtotal + taxAmount;

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.hallId) {
      toast.error('Please select a target venue/hall');
      return;
    }

    if (!formData.billToName.trim()) {
      toast.error('Please enter the client billing name');
      return;
    }

    const invalidItems = lineItems.some((item) => !item.description.trim() || item.quantity <= 0 || item.rate < 0);
    if (invalidItems) {
      toast.error('All line items must have a description, quantity > 0, and rate >= 0');
      return;
    }

    try {
      const resultHtml = await generateCustomInvoiceMutation.mutateAsync({
        hallId: formData.hallId,
        billToName: formData.billToName.trim(),
        billToPhone: formData.billToPhone.trim() || undefined,
        billToEmail: formData.billToEmail.trim() || undefined,
        billToAddress: formData.billToAddress.trim() || undefined,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        invoiceNo: formData.invoiceNo.trim() || undefined,
        taxEnabled: formData.taxEnabled,
        taxPercentage: formData.taxPercentage,
        items: lineItems.map(({ description, quantity, rate }) => ({ description, quantity, rate })),
        notes: formData.notes.trim() || undefined
      });

      // Print invoice via new window
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(resultHtml);
        win.document.close();
        setTimeout(() => {
          win.print();
        }, 500);
      }
    } catch {
      // Error handled in mutation hook
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Header */}
      <div className="border-b border-gray-150 pb-4">
        <h1 className="text-2xl font-black tracking-tight text-gray-900 font-sans">Custom Invoice Generator</h1>
        <p className="text-sm text-gray-500 mt-1">Generate, preview, and print custom invoices for onboarding setup fees, custom modifications, or offline plans.</p>
      </div>

      <form onSubmit={handleGenerateInvoice} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Form Parameters */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Client & Venue Selection */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 text-indigo-700">
              <Building className="h-4 w-4" />
              1. Client & Venue Selection
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Hall Selector */}
              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Venue / Marriage Hall *
                </label>
                <select
                  value={formData.hallId}
                  onChange={handleHallChange}
                  required
                  className="px-3.5 py-2 w-full rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white"
                >
                  <option value="">-- Choose an onboarded hall --</option>
                  {halls.map((hall) => (
                    <option key={hall.id} value={hall.id}>
                      {hall.hall_name} ({hall.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bill To Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Bill To (Client Name) *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="billToName"
                    value={formData.billToName}
                    onChange={handleInputChange}
                    required
                    placeholder="Owner or Hall Name"
                    className="pl-9 pr-4 py-2 w-full rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white"
                  />
                </div>
              </div>

              {/* Bill To Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Contact Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="billToPhone"
                    value={formData.billToPhone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 98765 43210"
                    className="pl-9 pr-4 py-2 w-full rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white"
                  />
                </div>
              </div>

              {/* Bill To Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Billing Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="billToEmail"
                    value={formData.billToEmail}
                    onChange={handleInputChange}
                    placeholder="e.g. billing@venue.com"
                    className="pl-9 pr-4 py-2 w-full rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white"
                  />
                </div>
              </div>

              {/* Bill To Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Billing Address / City (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="billToAddress"
                    value={formData.billToAddress}
                    onChange={handleInputChange}
                    placeholder="e.g. 12 Main St, Chennai"
                    className="pl-9 pr-4 py-2 w-full rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Section: Line Items Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 text-indigo-700">
                <Calculator className="h-4 w-4" />
                2. Invoice Line Items
              </h3>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#062089] hover:text-[#062089]/85 cursor-pointer bg-[#062089]/5 px-2 py-1 rounded-lg border border-[#062089]/10"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3.5 items-center">
                  
                  {/* Item Description */}
                  <div className="col-span-6 space-y-1.5">
                    {index === 0 && (
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Description / Services
                      </label>
                    )}
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      required
                      placeholder="e.g. Custom module design, Setup services"
                      className="px-3 py-2 w-full rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 space-y-1.5">
                    {index === 0 && (
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono text-center">
                        Qty
                      </label>
                    )}
                    <input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                      required
                      min="1"
                      className="px-3 py-2 w-full rounded-xl border border-slate-200 text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white font-mono"
                    />
                  </div>

                  {/* Rate */}
                  <div className="col-span-2 space-y-1.5">
                    {index === 0 && (
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono text-right">
                        Rate (₹)
                      </label>
                    )}
                    <input
                      type="number"
                      value={item.rate || ''}
                      onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
                      required
                      min="0"
                      step="any"
                      className="px-3 py-2 w-full rounded-xl border border-slate-200 text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white font-mono"
                    />
                  </div>

                  {/* Computed Amount & Action */}
                  <div className="col-span-2 flex items-center justify-between gap-1.5 mt-auto">
                    <div className="text-right w-full pr-1 font-mono font-bold text-xs text-slate-700">
                      {index === 0 && (
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Amount
                        </span>
                      )}
                      {formatCurrency(item.quantity * item.rate)}
                    </div>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className={`text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors mt-auto ${
                          index === 0 ? 'mt-5' : ''
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Meta details, calculation Summary, Print action */}
        <div className="space-y-6">
          
          {/* Metadata & Dates */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
              3. Invoice Parameters
            </h3>

            {/* Custom Invoice No */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Invoice Number (Optional)
              </label>
              <input
                type="text"
                name="invoiceNo"
                value={formData.invoiceNo}
                onChange={handleInputChange}
                placeholder="e.g. INF-HOD-1049 (Auto-fills if empty)"
                className="px-3.5 py-2 w-full rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white"
              />
            </div>

            {/* Invoice Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Invoice Date *
              </label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleInputChange}
                required
                className="px-3.5 py-2 w-full rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
                className="px-3.5 py-2 w-full rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white"
              />
            </div>
          </div>

          {/* Calculations Summary Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
              4. Payment Summary
            </h3>

            {/* Tax Settings */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Enable Tax / GST</span>
                <input
                  type="checkbox"
                  name="taxEnabled"
                  checked={formData.taxEnabled}
                  onChange={handleInputChange}
                  className="h-4.5 w-4.5 text-[#062089] focus:ring-[#062089] border-slate-300 rounded cursor-pointer"
                />
              </div>

              {formData.taxEnabled && (
                <div className="flex items-center justify-between gap-2.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    GST Rate (%)
                  </span>
                  <div className="relative max-w-[80px]">
                    <input
                      type="number"
                      name="taxPercentage"
                      value={formData.taxPercentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="any"
                      required={formData.taxEnabled}
                      className="px-2.5 py-1.5 pr-6 w-full rounded-lg border border-slate-200 text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white font-mono"
                    />
                    <Percent className="absolute right-1.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Computations list */}
            <div className="space-y-2.5 pt-1.5 border-b border-slate-100 pb-3">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono text-slate-700">{formatCurrency(subtotal)}</span>
              </div>
              
              {formData.taxEnabled && (
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>GST ({formData.taxPercentage}%)</span>
                  <span className="font-mono text-slate-700">{formatCurrency(taxAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-black text-slate-800 pt-1.5 border-t border-dashed border-slate-200">
                <span>Total Due</span>
                <span className="font-mono text-indigo-700 text-base">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Invoice Footer Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Notes for client..."
                className="px-3.5 py-2 w-full rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#062089] text-slate-800 bg-white resize-none"
              />
            </div>

            {/* Print Submit Button */}
            <button
              type="submit"
              disabled={generateCustomInvoiceMutation.isPending || hallsLoading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#062089] hover:bg-[#062089]/95 border border-blue-900 shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generateCustomInvoiceMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Invoice PDF...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4" />
                  Generate & Print Invoice
                </>
              )}
            </button>

          </div>

        </div>

      </form>
    </div>
  );
}
