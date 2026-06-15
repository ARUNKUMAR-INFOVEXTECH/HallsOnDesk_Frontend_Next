'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import * as supportService from '@/services/api/modules/support.service';
import { SupportTicket, SupportTicketMessage } from '@/types';
import { 
  LifeBuoy, 
  Plus, 
  MessageSquare, 
  Send, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Loader2,
  Paperclip,
  Check,
  User,
  AlertTriangle
} from 'lucide-react';

export default function OwnerSupportPage() {
  const user = useAuthStore((state) => state.user);
  
  // State variables
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubjectTemplate, setSelectedSubjectTemplate] = useState<string>('Subscription Renewal or Upgrade Issue');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'bug' | 'billing' | 'enquiry' | 'other'>('bug');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch all tickets on load
  const fetchTickets = async (selectId?: string) => {
    try {
      setIsLoading(true);
      const data = await supportService.getTickets();
      setTickets(data);
      if (selectId) {
        const updatedSelected = data.find((t) => t.id === selectId);
        if (updatedSelected) setSelectedTicket(updatedSelected);
      } else if (data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Scroll to bottom of chat when selected ticket or messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  // Handle message send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket || isSending) return;

    try {
      setIsSending(true);
      const data = await supportService.addTicketMessage(selectedTicket.id, replyText);
      setReplyText('');
      
      // Update local tickets state and selected ticket
      setTickets((prevTickets) =>
        prevTickets.map((t) => (t.id === selectedTicket.id ? data.ticket : t))
      );
      setSelectedTicket(data.ticket);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const SUBJECT_TEMPLATES = [
    "Subscription Renewal or Upgrade Issue",
    "Payment Verification / Pending Invoice",
    "Billing Inaccuracy or Refund Request",
    "Login issue / Staff Role Permissions",
    "System Lag or Performance Issue",
    "Software Bug / Operational Error",
    "Feature Suggestion / Integration Request",
    "Other (Write your custom subject below)"
  ];

  // Handle ticket creation
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSubject = selectedSubjectTemplate === "Other (Write your custom subject below)"
      ? customSubject
      : selectedSubjectTemplate;

    if (!finalSubject.trim() || !newDescription.trim()) {
      setErrorMsg('Subject and description are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const data = await supportService.createTicket({
        subject: finalSubject,
        description: newDescription,
        category: newCategory,
        priority: newPriority,
      });

      // Clear form
      setSelectedSubjectTemplate('Subscription Renewal or Upgrade Issue');
      setCustomSubject('');
      setNewDescription('');
      setNewCategory('bug');
      setNewPriority('medium');
      setIsModalOpen(false);

      // Refresh list and select the new ticket
      await fetchTickets(data.ticket.id);
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit support ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">Open</span>;
      case 'in_progress':
        return <span className="bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">In Progress</span>;
      case 'resolved':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Resolved</span>;
      default:
        return <span className="bg-gray-50 text-gray-750 border border-gray-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">{status}</span>;
    }
  };

  // Helper for priority badge styles
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="bg-rose-50 text-rose-700 border border-rose-100 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase">High</span>;
      case 'medium':
        return <span className="bg-amber-50 text-amber-700 border border-amber-100 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase">Medium</span>;
      case 'low':
        return <span className="bg-slate-50 text-slate-700 border border-slate-100 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase">Low</span>;
      default:
        return <span className="bg-gray-50 text-gray-700 border border-gray-100 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase">{priority}</span>;
    }
  };

  // Format date correctly in DD/MM/YYYY
  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString('en-GB'); // Outputs DD/MM/YYYY
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} at ${timeStr}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-gray-50/50">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-8.5 w-8.5 rounded-lg bg-[#EE9B00]/10 flex items-center justify-center border border-[#EE9B00]/25">
            <LifeBuoy className="h-4.5 w-4.5 text-[#EE9B00]" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">Help & Support Center</h1>
            <p className="text-[11px] text-gray-400 font-medium">Create support tickets and consult our support agents.</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#EE9B00] hover:bg-[#D48A00] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Support Ticket
        </button>
      </div>

      {/* Main content grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Ticket List */}
        <div className="w-80 border-r border-gray-100 bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-50 font-bold text-[10px] text-gray-400 uppercase tracking-wider">
            Your Support Tickets ({tickets.length})
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {isLoading && tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs font-medium">Loading tickets...</span>
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400 gap-3 mt-12">
                <MessageSquare className="h-8 w-8 text-gray-300" />
                <div>
                  <p className="text-xs font-bold text-gray-700">No tickets found</p>
                  <p className="text-[11px] text-gray-400 mt-1">Submit a ticket if you need help with anything.</p>
                </div>
              </div>
            ) : (
              tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                const latestMessage = t.messages?.[t.messages.length - 1];
                
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 cursor-pointer transition-colors relative hover:bg-gray-50/50 ${
                      isSelected ? 'bg-[#EE9B00]/5 hover:bg-[#EE9B00]/5 border-l-2 border-[#EE9B00]' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded px-1">
                        {t.ticketNumber}
                      </span>
                      <span className="text-[9px] text-gray-400 font-semibold font-mono">
                        {new Date(t.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-xs truncate mb-1.5">
                      {t.subject}
                    </h3>
                    {latestMessage && (
                      <p className="text-[11px] text-gray-400 font-medium truncate mb-2.5">
                        {latestMessage.sender === 'admin' ? 'Support: ' : 'You: '}
                        {latestMessage.message}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(t.status)}
                      {getPriorityBadge(t.priority)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Selected Ticket Details & Thread */}
        <div className="flex-1 bg-gray-50/30 flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Ticket Top Meta */}
              <div className="bg-white border-b border-gray-100 px-6 py-4.5 flex justify-between items-center shrink-0 shadow-sm">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-150 px-2 py-0.5 rounded">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-450 font-bold capitalize">
                      Category: <span className="text-gray-700 font-extrabold">{selectedTicket.category}</span>
                    </span>
                  </div>
                  <h2 className="font-bold text-gray-900 text-sm leading-snug">{selectedTicket.subject}</h2>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-gray-400 block font-semibold">Created on</span>
                    <span className="text-xs text-gray-750 font-bold uppercase font-mono">
                      {new Date(selectedTicket.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              {/* Chat messages viewport */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedTicket.messages && selectedTicket.messages.map((msg, i) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={i}
                      className={`flex ${isAdmin ? 'justify-start' : 'justify-end'} gap-3 max-w-[85%] ${
                        isAdmin ? 'mr-auto' : 'ml-auto'
                      }`}
                    >
                      {isAdmin && (
                        <div className="h-8.5 w-8.5 rounded-full bg-violet-100 border border-violet-200 text-violet-750 flex items-center justify-center shrink-0 font-bold text-xs uppercase shadow-sm">
                          SU
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold text-gray-400 ${!isAdmin ? 'text-right' : ''}`}>
                          {msg.senderName} • {formatTimestamp(msg.timestamp)}
                        </span>
                        
                        <div
                          className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm font-medium border ${
                            isAdmin
                              ? 'bg-white text-gray-750 border-gray-100 rounded-tl-none'
                              : 'bg-[#EE9B00] text-white border-[#EE9B00] rounded-tr-none'
                          }`}
                        >
                          <p className="whitespace-pre-line font-medium leading-relaxed">{msg.message}</p>
                        </div>
                      </div>

                      {!isAdmin && (
                        <div className="h-8.5 w-8.5 rounded-full bg-[#EE9B00]/15 border border-[#EE9B00]/30 text-[#EE9B00] flex items-center justify-center shrink-0 font-bold text-xs uppercase shadow-sm">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Reply message input footer */}
              {selectedTicket.status === 'resolved' ? (
                <div className="bg-emerald-50/50 border-t border-emerald-100/50 p-4.5 text-center text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 shrink-0">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                  This ticket is marked resolved. Sending a message will reopen the ticket.
                </div>
              ) : null}

              <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-150 p-4.5 shrink-0 shadow-inner flex items-center gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={selectedTicket.status === 'resolved' ? 'Type a message to reopen this ticket...' : 'Write your response here...'}
                  disabled={isSending}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium text-gray-700 placeholder-gray-450 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:bg-gray-100"
                />
                
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="bg-[#EE9B00] hover:bg-[#D48A00] text-white p-3 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <Send className="h-4.5 w-4.5" />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 gap-3.5">
              <LifeBuoy className="h-12 w-12 text-[#EE9B00]/40 animate-pulse" />
              <div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">Select a ticket or create a new one</h3>
                <p className="text-xs text-gray-400 font-medium">Our customer support agents will help resolve issues as soon as possible.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE TICKET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn border border-gray-100 flex flex-col">
            <div className="px-6 py-4.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <LifeBuoy className="h-5 w-5 text-[#EE9B00]" />
                <h2 className="font-bold text-gray-900 text-sm">Create Support Ticket</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-[11px] font-bold flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subject</label>
                <select
                  value={selectedSubjectTemplate}
                  onChange={(e) => {
                    setSelectedSubjectTemplate(e.target.value);
                    const val = e.target.value;
                    if (val.includes("Subscription") || val.includes("Billing") || val.includes("Payment")) {
                      setNewCategory("billing");
                    } else if (val.includes("Bug") || val.includes("Error") || val.includes("Performance") || val.includes("Lag")) {
                      setNewCategory("bug");
                    } else if (val.includes("Integration") || val.includes("Suggestion") || val.includes("Staff") || val.includes("Login")) {
                      setNewCategory("enquiry");
                    } else {
                      setNewCategory("other");
                    }
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-650 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                >
                  {SUBJECT_TEMPLATES.map((tpl) => (
                    <option key={tpl} value={tpl}>{tpl}</option>
                  ))}
                </select>

                {selectedSubjectTemplate === "Other (Write your custom subject below)" && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom subject here..."
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all mt-2 animate-fadeIn"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-650 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="bug">Technical Bug</option>
                    <option value="billing">Billing & Packages</option>
                    <option value="enquiry">General Enquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-650 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the problem you are facing. Please list error messages or steps to reproduce if applicable."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 bg-[#EE9B00] hover:bg-[#D48A00] text-white px-4.5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Ticket'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
