import apiClient from '../client';

export interface MuhurthamDate {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  notes?: string;
  created_at?: string;
}

export async function getMuhurthamDates(params: { from_date?: string; to_date?: string } = {}): Promise<MuhurthamDate[]> {
  const res = await apiClient.get<MuhurthamDate[]>('/muhurthams', { params });
  return res.data;
}

export async function addMuhurthamDate(data: { date: string; title?: string; notes?: string }): Promise<{ message: string; data: MuhurthamDate }> {
  const res = await apiClient.post<{ message: string; data: MuhurthamDate }>('/muhurthams', data);
  return res.data;
}
