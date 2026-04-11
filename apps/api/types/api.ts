export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ContractStatus = 'pending' | 'uploaded' | 'analyzing' | 'complete' | 'error'
export type WorkspaceRole = 'owner' | 'admin' | 'member'
export type MessageRole = 'user' | 'assistant'

export interface GeminiAnalysisResponse {
  summary: string
  overall_risk_level: RiskLevel
  risk_score: number
  key_obligations: string[]
  red_flags: string[]
  clauses: GeminiClause[]
}

export interface GeminiClause {
  raw_text: string
  category: string
  risk_level: RiskLevel
  rationale: string
  position: number
}

export interface UploadContractRequest {
  name: string
  file_name: string
  file_size: number
  mime_type: string
  workspace_id: string
}

export interface UploadContractResponse {
  contract_id: string
  upload_url: string
  upload_path: string
  token: string
}

export interface ChatMessageRequest {
  session_id: string
  content: string
  mode?: 'normal' | 'redteam'
}

export interface DashboardStats {
  total_contracts: number
  contracts_by_risk: Record<RiskLevel, number>
  pending_analysis: number
  recent_high_risk_clauses: RecentClause[]
}

export interface RecentClause {
  id: string
  contract_name: string
  category: string
  risk_level: RiskLevel
  rationale: string
}
