import apiClient from '../client';
import { SupportTicket } from '@/types';

export async function createTicket(data: {
  subject: string;
  description: string;
  category: 'bug' | 'billing' | 'enquiry' | 'other';
  priority: 'low' | 'medium' | 'high';
}): Promise<{ message: string; ticket: SupportTicket }> {
  const res = await apiClient.post<{ message: string; ticket: SupportTicket }>('/support/tickets', data);
  return res.data;
}

export async function getTickets(): Promise<SupportTicket[]> {
  const res = await apiClient.get<SupportTicket[]>('/support/tickets');
  return res.data;
}

export async function getTicketById(id: string): Promise<SupportTicket> {
  const res = await apiClient.get<SupportTicket>(`/support/tickets/${id}`);
  return res.data;
}

export async function addTicketMessage(id: string, message: string): Promise<{ message: string; ticket: SupportTicket }> {
  const res = await apiClient.post<{ message: string; ticket: SupportTicket }>(`/support/tickets/${id}/messages`, { message });
  return res.data;
}
