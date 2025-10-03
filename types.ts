export enum AgentName {
  DECOMPOSITION = "Decomposition",
  MARKET_DATA = "Market & Competitor Data",
  EXIM = "EXIM Trade Flows",
  PATENTS = "Patent Landscape",
  CLINICAL = "Clinical Trials",
  INTERNAL = "Internal Documents",
  WEB = "Web Intelligence",
  SYNTHESIS = "Synthesis",
  REPORT_GENERATOR = "Report Generator",
}

export enum AgentStatus {
  QUEUED = "Queued",
  RUNNING = "Running",
  DONE = "Done",
  FAILED = "Failed",
}

export interface AgentError {
  message: string;
  suggestion?: string;
}

export interface AgentResultData {
  [AgentName.MARKET_DATA]?: {
    therapy: string;
    molecule: string;
    marketSizeUSD: string;
    cagr: string;
    topCompetitors: { name: string; share: string }[];
    insights: string;
    marketGrowth: { year: number; sizeB: number }[];
  };
  [AgentName.EXIM]?: {
    apiName: string;
    exportVolumes: { country: string; value: string }[];
    importDependency: string;
    topSourcingCountries: { country: string; share: string }[];
  };
  [AgentName.PATENTS]?: {
    patents: { title: string; url: string; expiryDate: string; owner: string; ftRisk: 'Low' | 'Medium' | 'High' }[];
  };
  [AgentName.CLINICAL]?: {
    trials: { id: string; title: string; phase: string; status: string; sponsor: string }[];
  };
  [AgentName.INTERNAL]?: {
    summary: string[];
  };
  [AgentName.WEB]?: {
    webSignals: { title: string; url: string; source: string; excerpt: string; sentiment: number; }[];
  };
  raw?: string;
}

export interface Agent {
  name: AgentName;
  status: AgentStatus;
  result: AgentResultData | null;
  error?: AgentError;
  id: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  id: string;
}