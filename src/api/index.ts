import axios from 'axios';
import type {
  DataLoadResponseDTO,
  FullSummaryResponseDTO,
  DeliverySummaryResponseDTO,
  ManagerDeliverySlaResponseDTO,
  B2CSummaryResponseDTO,
  ManagerB2CSlaResponseDTO,
  OrderTimelineResponseDTO,
  HealthResponseDTO
} from './types';

const api = axios.create({
  baseURL: '/',
});

export const dataApi = {
  load: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<DataLoadResponseDTO>('/api/data/load', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const slaApi = {
  getFullSummary: (params: {
    dateFrom?: string;
    dateTo?: string;
    managerId?: string;
    qualification?: string;
  }) => api.get<FullSummaryResponseDTO>('/api/sla/full/summary', { params }),

  getDeliverySummary: (params: {
    dateFrom?: string;
    dateTo?: string;
    managerId?: string;
    qualification?: string;
    deliveryService?: string;
  }) => api.get<DeliverySummaryResponseDTO>('/api/sla/delivery/summary', { params }),

  getDeliveryByManager: (params: {
    dateFrom?: string;
    dateTo?: string;
    managerId?: string;
    qualification?: string;
    deliveryService?: string;
  }) => api.get<ManagerDeliverySlaResponseDTO>('/api/sla/delivery/by-manager', { params }),

  getB2CSummary: (params: {
    dateFrom?: string;
    dateTo?: string;
    managerId?: string;
    qualification?: string;
  }) => api.get<B2CSummaryResponseDTO>('/api/sla/b2c/summary', { params }),

  getB2CByManager: (params: {
    dateFrom?: string;
    dateTo?: string;
    managerId?: string;
    qualification?: string;
  }) => api.get<ManagerB2CSlaResponseDTO>('/api/sla/b2c/by-manager', { params }),

  getConfig: () => api.get('/api/sla/config'),
};

export const autocompleteApi = {
  getQualifications: (query?: string, limit?: number, signal?: AbortSignal) =>
    api.get<string[]>('/api/autocomplete/qualifications', { params: { query, limit }, signal }),
  
  getManagers: (query?: string, limit?: number, signal?: AbortSignal) =>
    api.get<string[]>('/api/autocomplete/managers', { params: { query, limit }, signal }),
  
  getLeads: (query?: string, limit?: number, signal?: AbortSignal) =>
    api.get<string[]>('/api/autocomplete/leads', { params: { query, limit }, signal }),
  
  getDeliveryServices: (query?: string, limit?: number, signal?: AbortSignal) =>
    api.get<string[]>('/api/autocomplete/delivery-services', { params: { query, limit }, signal }),
  
  getDeliveryManagers: (query?: string, limit?: number, signal?: AbortSignal) =>
    api.get<string[]>('/api/autocomplete/delivery-managers', { params: { query, limit }, signal }),
  
  getCities: (query?: string, limit?: number, signal?: AbortSignal) =>
    api.get<string[]>('/api/autocomplete/cities', { params: { query, limit }, signal }),
};

export const orderApi = {
  getTimeline: (leadId: string) =>
    api.get<OrderTimelineResponseDTO>(`/api/orders/${leadId}/timeline`),
};

export const healthApi = {
  check: () => api.get<HealthResponseDTO>('/api/health'),
};

export default api;
