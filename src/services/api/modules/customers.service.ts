import apiClient from '../client';
import { Customer } from '@/types';

export interface CustomersQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CustomersListResponse {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export async function getCustomers(params: CustomersQuery = {}): Promise<CustomersListResponse> {
  const res = await apiClient.get<CustomersListResponse>('/customers', { params });
  return res.data;
}

export async function createCustomer(data: {
  customer_name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}): Promise<{ message: string; data: Customer }> {
  const res = await apiClient.post<{ message: string; data: Customer }>('/customers', data);
  return res.data;
}

export async function getCustomerById(id: string): Promise<Customer & { bookings: any[] }> {
  const res = await apiClient.get<Customer & { bookings: any[] }>(`/customers/${id}`);
  return res.data;
}

export async function updateCustomer(
  id: string,
  data: {
    customer_name?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }
): Promise<{ message: string }> {
  const res = await apiClient.put<{ message: string }>(`/customers/${id}`, data);
  return res.data;
}

export async function deleteCustomer(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`/customers/${id}`);
  return res.data;
}
