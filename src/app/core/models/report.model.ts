export interface RiskFactor {
  factor: string;
  severity: string;
  description: string;
}

export interface ReportSummary {
  reportId: string;
  requestId: string;
  scoringId: string;
  title: string;
  generatedBy: string;
  generatedDate: string;
  fileSizeBytes: number;
}

export interface ReportDetails extends ReportSummary {
  reportType: string;
  aiSummary: string;
  riskAnalysis: string;
  riskFactors: RiskFactor[];
  recommendations: string[];
  modelVersion: string;
  language: string;
}
