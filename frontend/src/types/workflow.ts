export interface WorkflowDefinition {
  id: string;
  entity_type: string;
  name: string;
  states: WorkflowStateDef[];
  transitions: WorkflowTransitionDef[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStateDef {
  name: string;
  label: string;
  description?: string;
  is_terminal?: boolean;
  color?: string;
}

export interface WorkflowTransitionDef {
  from_state: string;
  to_state: string;
  action: string;
  label: string;
  required_role?: string;
  requires_approval?: boolean;
}

export interface WorkflowInstance {
  id: string;
  workflow_definition_id: string;
  entity_type: string;
  entity_id: string;
  current_state: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowLog {
  id: string;
  workflow_instance_id: string;
  from_state: string | null;
  to_state: string;
  action: string;
  comment: string | null;
  performed_by: string | null;
  performed_by_name?: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ApprovalRequest {
  id: string;
  entity_type: string;
  entity_id: string;
  request_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requested_by: string | null;
  requested_by_name?: string;
  level: number;
  max_level: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  levels?: ApprovalLevel[];
}

export interface ApprovalLevel {
  id: string;
  approval_request_id: string;
  level_number: number;
  required_roles: string[] | null;
  required_users: string[] | null;
  actual_approvers: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
  actions?: ApprovalAction[];
}

export interface ApprovalAction {
  id: string;
  approval_level_id: string;
  approval_request_id: string;
  action: 'approved' | 'rejected';
  comment: string | null;
  performed_by: string | null;
  performed_by_name?: string;
  created_at: string;
}

export interface Task {
  id: string;
  entity_type: string | null;
  entity_id: string | null;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_to_name?: string;
  assigned_by: string | null;
  assigned_by_name?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_at: string | null;
  completed_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  comment: string;
  created_by: string | null;
  created_by_name?: string;
  created_at: string;
}

export interface SLADefinition {
  id: string;
  entity_type: string;
  name: string;
  from_status: string | null;
  to_status: string;
  sla_hours: number;
  severity: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SLABreach {
  id: string;
  sla_definition_id: string;
  entity_type: string;
  entity_id: string;
  expected_at: string;
  breached_at: string | null;
  status: string;
  resolved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  sla_name?: string;
  severity?: string;
  sla_hours?: number;
}

export interface EscalationRule {
  id: string;
  sla_definition_id: string | null;
  entity_type: string;
  name: string;
  trigger_after_minutes: number;
  escalate_to_role: string | null;
  escalate_to_user: string | null;
  notify: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sla_name?: string;
}

export interface EscalationInstance {
  id: string;
  escalation_rule_id: string;
  sla_breach_id: string | null;
  escalated_to: string | null;
  escalated_by: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  description: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  performed_by: string | null;
  performed_by_name?: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface TaskSummary {
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
}
