export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface DataLoadResponseDTO {
  loaded: number;
  updated: number;
  skipped: number;
  errors: number;
}

export interface Period {
  from: string;
  to: string;
}

export interface Item {
  sort_order: number;
  min_bound: number;
  max_bound: number;
  count: number;
  ratio: number;
}

export interface Metadata {
  unit: string;
  total_count: number;
}

export interface BreachDistributionDTO {
  metadata: Metadata;
  items: Item[];
}

export interface MetricDetails {
  threshold_minutes: number;
  total_orders: number;
  met_count: number;
  met_percent: number;
  breach_count: number;
  breach_percent: number;
  avg_minutes: number;
  median_minutes: number;
  p90_minutes: number;
  breach_distribution: BreachDistributionDTO;
}

export interface FullSummaryMetrics {
  full_total: MetricDetails;
}

export interface FullSummaryResponseDTO {
  period: Period;
  pipeline: string;
  metrics: FullSummaryMetrics;
}

export interface DeliverySummaryMetrics {
  sla4_to_pvz: MetricDetails;
  sla5_at_pvz: MetricDetails;
  delivery_total: MetricDetails;
}

export interface DeliverySummaryResponseDTO {
  period: Period;
  pipeline: string;
  metrics: DeliverySummaryMetrics;
}

export interface ManagerDeliveryData {
  manager_id: string;
  metrics: DeliverySummaryMetrics;
}

export interface ManagerDeliverySlaResponseDTO {
  period: Period;
  pipeline: string;
  data: ManagerDeliveryData[];
}

export interface B2CSummaryMetrics {
  sla1_reaction: MetricDetails;
  sla2_to_assembly: MetricDetails;
  sla3_to_delivery: MetricDetails;
  b2c_total: MetricDetails;
}

export interface B2CSummaryResponseDTO {
  period: Period;
  pipeline: string;
  metrics: B2CSummaryMetrics;
}

export interface ManagerB2CData {
  manager_id: string;
  metrics: B2CSummaryMetrics;
}

export interface ManagerB2CSlaResponseDTO {
  period: Period;
  pipeline: string;
  data: ManagerB2CData[];
}

export type OrderStage = 
  | 'CREATED'
  | 'CLOSED'
  | 'TO_ASSEMBLY'
  | 'SALE'
  | 'HANDED_TO_DELIVERY'
  | 'ISSUED_OR_PVZ'
  | 'RECEIVED'
  | 'REJECTED'
  | 'RETURNED';

export interface OrderTimelineStepDTO {
  stage: OrderStage;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  durationDays: number;
  slaViolated: boolean;
  slaThreshold: string;
}

export interface OrderTimelineResponseDTO {
  period: Period;
  pipeline: string;
  data: OrderTimelineStepDTO[];
}

export interface HealthResponseDTO {
  status: string;
  version: string;
}
