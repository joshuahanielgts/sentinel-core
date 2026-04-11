export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ContractStatus = 'pending' | 'uploaded' | 'analyzing' | 'complete' | 'error';
export type WorkspaceRole = 'owner' | 'admin' | 'member';
export type MessageRole = 'user' | 'assistant';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  role?: WorkspaceRole;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

export interface Contract {
  id: string;
  workspace_id: string;
  uploaded_by: string;
  name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  status: ContractStatus;
  risk_score: number | null;
  summary: string | null;
  key_obligations: string[] | null;
  red_flags: string[] | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractClause {
  id: string;
  contract_id: string;
  workspace_id: string;
  raw_text: string;
  category: string;
  risk_level: RiskLevel;
  rationale: string;
  position: number | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  contract_id: string;
  workspace_id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface UploadContractResponse {
  contract_id: string;
  upload_url: string;
  upload_path: string;
  token: string;
}

export interface DashboardStats {
  total_contracts: number;
  contracts_by_risk: Record<RiskLevel, number>;
  pending_analysis: number;
  recent_high_risk_clauses: RecentClause[];
}

export interface RecentClause {
  id: string;
  contract_name: string;
  category: string;
  risk_level: RiskLevel;
  rationale: string;
}
