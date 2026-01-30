// Analytics Types
export type AnalyticsEventType =
  | 'page_visit'
  | 'resume_upload'
  | 'template_view'
  | 'template_click'
  | 'payment_initiated'
  | 'payment_success'
  | 'download';

export interface AnalyticsEvent {
  id: number;
  eventType: AnalyticsEventType;
  sessionId: string;
  templateId?: string;
  targetRole?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface TrackEventRequest {
  eventType: AnalyticsEventType;
  sessionId: string;
  templateId?: string;
  targetRole?: string;
  metadata?: Record<string, any>;
}

export interface ConversionFunnel {
  pageVisits: number;
  resumeUploads: number;
  templateViews: number;
  paidTemplateClicks: number;
  paymentsInitiated: number;
  paymentsVerified: number;
  downloads: number;
}

export interface RoleDemand {
  role: string;
  searchCount: number;
  templateSelections: Record<string, number>;
  avgConversionRate: number;
}

export interface TemplatePerformance {
  templateId: string;
  name: string;
  views: number;
  clicks: number;
  payments: number;
  conversionRate: number;
  revenue: number;
}
