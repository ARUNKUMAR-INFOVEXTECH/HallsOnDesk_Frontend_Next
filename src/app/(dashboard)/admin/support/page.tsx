'use client';

import React, { useState } from 'react';
import { useAdminSupport } from '@/hooks/useAdmin';
import {
  LifeBuoy,
  Search,
  MessageSquare,
  AlertTriangle,
  Send,
  User,
  Clock,
  CheckCircle2,
  Inbox,
  AlertCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';

export default function AdminSupportPage() {
  const { tickets = [], isLoading, updateTicketStatus, addTicketMessage } = useAdminSupport();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('open'); // default open tickets

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || (tickets.length > 0 ? tickets[0] : null);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.hallName && t.hallName.toLowerCase().includes(search.toLowerCase())) ||
      t.id.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory ? t.category === selectedCategory : true;
    const matchesPriority = selectedPriority ? t.priority === selectedPriority : true;
    
    // Status filter matches: open, pending, resolved/closed
    let matchesStatus = true;
    if (selectedStatus === 'open') {
      matchesStatus = t.status === 'open' || t.status === 'pending';
    } else if (selectedStatus === 'resolved') {
      matchesStatus = t.status === 'resolved' || t.status === 'closed';
    } else {
      matchesStatus = true;
    }

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const handleStatusChange = async (ticketId: string, status: any) => {
    await updateTicketStatus({ ticketId, status });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyMessage.trim()) return;
    await addTicketMessage({
      ticketId: activeTicket.id,
      message: replyMessage,
    });
    setReplyMessage('');
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 text-red-700 border-red-150';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-150';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-150';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-150';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug':
        return <AlertCircle className="h-3.5 w-3.5 shrink-0" />;
      case 'billing':
        return <Inbox className="h-3.5 w-3.5 shrink-0" />;
      default:
        return <HelpCircle className="h-3.5 w-3.5 shrink-0" />;
    }
  };

  // Derive counts
  const totalOpenCount = tickets.filter(t => t.status === 'open' || t.status === 'pending').length;
  const totalBugCount = tickets.filter(t => t.category === 'bug').length;
  const totalFeatureCount = tickets.filter(t => t.category === 'feature_request').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">Support Center Triage</h1>
        <p className="text-sm text-gray-500 mt-1">
          Respond to technical bug reports, billing inquiries, and new feature requests.
        </p>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center shrink-0">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Backlog</span>
            <span className="text-xl font-extrabold text-gray-950 font-sans tracking-tight">{totalOpenCount} tickets</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
            <AlertCircle className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Bugs Reported</span>
            <span className="text-xl font-extrabold text-red-650 font-sans tracking-tight">{totalBugCount} items</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Feature Proposals</span>
            <span className="text-xl font-extrabold text-amber-650 font-sans tracking-tight">{totalFeatureCount} items</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Tickets Ledger */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-4">
          {/* Header search and status */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-150">
            <button
              onClick={() => setSelectedStatus('open')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                selectedStatus === 'open'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Backlog ({totalOpenCount})
            </button>
            <button
              onClick={() => setSelectedStatus('resolved')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                selectedStatus === 'resolved'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Resolved / Closed
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search subject or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* List items */}
          <div className="flex-1 space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="p-10 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                <span className="text-[10px] font-bold text-gray-400">Loading tickets...</span>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-10 text-center">
                <AlertCircle className="h-8 w-8 text-gray-450 mx-auto" />
                <span className="text-xs text-gray-400 font-bold block mt-2">No matching tickets</span>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isActive = activeTicket?.id === t.id;
                const priorityClass = getPriorityBadge(t.priority);
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3.5 border rounded-xl transition-all cursor-pointer flex flex-col gap-2 ${
                      isActive
                        ? 'bg-violet-50/20 border-violet-600 shadow-sm shadow-violet-600/5'
                        : 'border-gray-100 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-gray-400 font-bold font-mono">ID: {t.id}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border ${priorityClass}`}>
                        {t.priority}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-950 block truncate">{t.subject}</span>
                      <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">{t.hallName}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold border-t border-gray-50 pt-2 mt-1">
                      <div className="flex items-center gap-1 capitalize">
                        {getCategoryIcon(t.category)}
                        <span>{t.category.replace('_', ' ')}</span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(t.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Inspector Details Canvas */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {activeTicket ? (
            <div className="flex-1 flex flex-col h-full max-h-[600px]">
              {/* Top Details Header */}
              <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-950 text-sm">{activeTicket.subject}</h3>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 font-semibold">
                    <span>{activeTicket.hallName}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                    <span className="capitalize">{activeTicket.category.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">State:</span>
                  <select
                    value={activeTicket.status}
                    onChange={(e) => handleStatusChange(activeTicket.id, e.target.value as any)}
                    className="px-2 py-1 text-xs font-semibold bg-white border border-gray-200 rounded focus:ring-1 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[300px]">
                {/* Description first post */}
                <div className="p-4 bg-violet-50/20 border border-violet-100/50 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-violet-850 uppercase tracking-wider block">Description / Explanation</span>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">{activeTicket.description}</p>
                </div>

                <hr className="border-gray-50 my-2" />

                {/* Message logs */}
                {activeTicket.messages && activeTicket.messages.map((msg, i) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={i}
                      className={`flex gap-3 max-w-[85%] ${isAdmin ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border text-[11px] font-bold uppercase ${
                        isAdmin ? 'bg-violet-50 border-violet-100 text-violet-750' : 'bg-gray-100 border-gray-150 text-gray-650'
                      }`}>
                        {msg.senderName.charAt(0)}
                      </div>
                      <div className="space-y-1.5">
                        <div className={`p-3 rounded-xl text-xs leading-relaxed font-semibold ${
                          isAdmin
                            ? 'bg-violet-600 text-white rounded-tr-none'
                            : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-none'
                        }`}>
                          {msg.message}
                        </div>
                        <div className={`text-[9px] text-gray-400 font-semibold ${isAdmin ? 'text-right' : 'text-left'}`}>
                          {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Reply Box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-50 bg-gray-50/50 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter response response template..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="px-3 py-2 flex-1 text-xs font-semibold bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                  required
                />
                <button
                  type="submit"
                  className="flex items-center justify-center p-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white cursor-pointer transition-colors shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="p-16 text-center flex-1 flex flex-col justify-center items-center">
              <LifeBuoy className="h-10 w-10 text-gray-300" />
              <h3 className="font-bold text-gray-800 text-sm mt-3">Select a Support Ticket</h3>
              <p className="text-xs text-gray-450 mt-1">Review customer issues and respond to client request threads.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
