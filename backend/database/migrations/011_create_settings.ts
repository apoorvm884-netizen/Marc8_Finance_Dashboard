import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('company_profile', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('company_name', 255);
    table.string('logo_url', 500);
    table.text('address');
    table.string('phone', 50);
    table.string('email', 255);
    table.string('gst_number', 50);
    table.string('currency', 10).notNullable().defaultTo('INR');
    table.string('timezone', 100).notNullable().defaultTo('Asia/Kolkata');
    table.string('date_format', 20).notNullable().defaultTo('DD/MM/YYYY');
    table.string('financial_year_start', 10).notNullable().defaultTo('01-04');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('dashboard_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('default_dashboard', 50).notNullable().defaultTo('executive');
    table.string('default_date_range', 50).notNullable().defaultTo('last_30_days');
    table.specificType('default_charts', 'jsonb').notNullable().defaultTo(knex.raw("'[\"revenue_trend\",\"expense_breakdown\",\"profit_overview\",\"fleet_performance\"]'::jsonb"));
    table.specificType('widget_visibility', 'jsonb').notNullable().defaultTo(knex.raw("'{\"kpi_cards\":true,\"trend_charts\":true,\"breakdown_charts\":true,\"recent_activity\":true,\"top_vehicles\":true,\"alerts\":true}'::jsonb"));
    table.specificType('dashboard_layout', 'jsonb').notNullable().defaultTo(knex.raw("'{\"layout\":\"grid\",\"columns\":2}'::jsonb"));
    table.timestamps(true, true);
  });

  await knex.schema.createTable('financial_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('default_currency', 10).notNullable().defaultTo('INR');
    table.string('currency_symbol', 10).notNullable().defaultTo('₹');
    table.integer('decimal_precision').notNullable().defaultTo(2);
    table.decimal('tax_percentage', 5, 2).notNullable().defaultTo(18);
    table.string('invoice_prefix', 20).notNullable().defaultTo('INV-');
    table.string('booking_prefix', 20).notNullable().defaultTo('BKG-');
    table.string('journal_prefix', 20).notNullable().defaultTo('JRN-');
    table.string('expense_prefix', 20).notNullable().defaultTo('EXP-');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('notification_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.boolean('email_notifications').notNullable().defaultTo(true);
    table.boolean('browser_notifications').notNullable().defaultTo(true);
    table.boolean('reminder_settings').notNullable().defaultTo(true);
    table.boolean('daily_summary').notNullable().defaultTo(false);
    table.boolean('weekly_summary').notNullable().defaultTo(false);
    table.boolean('monthly_summary').notNullable().defaultTo(false);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('user_preferences', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('theme', 20).notNullable().defaultTo('dark');
    table.string('sidebar_state', 20).notNullable().defaultTo('expanded');
    table.string('language', 10).notNullable().defaultTo('en');
    table.string('table_density', 20).notNullable().defaultTo('comfortable');
    table.integer('default_page_size').notNullable().defaultTo(10);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('security_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.specificType('password_policy', 'jsonb').notNullable().defaultTo(knex.raw("'{\"min_length\":8,\"require_uppercase\":true,\"require_lowercase\":true,\"require_numbers\":true,\"require_special\":false}'::jsonb"));
    table.integer('session_timeout_minutes').notNullable().defaultTo(60);
    table.boolean('two_factor_enabled').notNullable().defaultTo(false);
    table.integer('max_login_attempts').notNullable().defaultTo(5);
    table.timestamps(true, true);
  });

  await knex.schema.raw(`CREATE INDEX idx_company_profile_updated_at ON company_profile(updated_at)`);
  await knex.schema.raw(`CREATE INDEX idx_dashboard_settings_updated_at ON dashboard_settings(updated_at)`);
  await knex.schema.raw(`CREATE INDEX idx_financial_settings_updated_at ON financial_settings(updated_at)`);
  await knex.schema.raw(`CREATE INDEX idx_notification_settings_updated_at ON notification_settings(updated_at)`);
  await knex.schema.raw(`CREATE INDEX idx_user_preferences_updated_at ON user_preferences(updated_at)`);
  await knex.schema.raw(`CREATE INDEX idx_security_settings_updated_at ON security_settings(updated_at)`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('security_settings');
  await knex.schema.dropTableIfExists('user_preferences');
  await knex.schema.dropTableIfExists('notification_settings');
  await knex.schema.dropTableIfExists('financial_settings');
  await knex.schema.dropTableIfExists('dashboard_settings');
  await knex.schema.dropTableIfExists('company_profile');
}
