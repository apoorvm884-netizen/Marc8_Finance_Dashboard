export interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  event_type: string | null;
  conditions: AutomationCondition[];
  actions: AutomationActionDef[];
  schedule_config: Record<string, unknown> | null;
  is_active: boolean;
  priority: number;
  cooldown_minutes: number;
  max_executions: number;
  execution_count: number;
  last_executed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'between';
  value: unknown;
}

export interface AutomationActionDef {
  type: 'create_notification' | 'create_task' | 'create_alert' | 'create_recommendation' | 'trigger_workflow' | 'send_email';
  config: Record<string, unknown>;
}

export interface AutomationExecution {
  id: string;
  automation_rule_id: string;
  event_type: string | null;
  entity_type: string | null;
  entity_id: string | null;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'skipped';
  trigger_type: 'event' | 'schedule' | 'manual';
  result: Record<string, unknown> | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  rule_name?: string;
}

export interface AutomationSummary {
  total: number;
  completed: number;
  failed: number;
  skipped: number;
  running: number;
}

export interface ScheduledJob {
  id: string;
  name: string;
  automation_rule_id: string | null;
  job_type: string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  cron_expression: string | null;
  schedule_config: Record<string, unknown> | null;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  retry_on_failure: boolean;
  max_retries: number;
  created_at: string;
  updated_at: string;
}

export interface ScheduledJobExecution {
  id: string;
  scheduled_job_id: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
  result: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
}

export interface BusinessAlert {
  id: string;
  alert_type: string;
  title: string;
  description: string | null;
  severity: 'info' | 'warning' | 'critical';
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Recommendation {
  id: string;
  recommendation_type: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  entity_type: string | null;
  entity_id: string | null;
  supporting_data: Record<string, unknown> | null;
  status: 'open' | 'actioned' | 'dismissed';
  actioned_at: string | null;
  actioned_by: string | null;
  created_at: string;
}
