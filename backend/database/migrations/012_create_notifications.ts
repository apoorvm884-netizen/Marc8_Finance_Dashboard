import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasNotificationType = await knex.schema.raw(
    `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') as exists`
  );
  if (!hasNotificationType.rows[0].exists) {
    await knex.schema.raw(
      `CREATE TYPE notification_type AS ENUM ('system', 'success', 'warning', 'error', 'info')`
    );
  }

  const hasReminderType = await knex.schema.raw(
    `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reminder_type') as exists`
  );
  if (!hasReminderType.rows[0].exists) {
    await knex.schema.raw(
      `CREATE TYPE reminder_type AS ENUM (
        'insurance_renewal', 'vehicle_service_due', 'road_tax_due', 'permit_expiry',
        'fastag_low_balance', 'pending_journal_entries', 'pending_expenses',
        'pending_bookings', 'high_expense_alert', 'negative_profit_alert',
        'inactive_vehicles', 'vehicles_without_bookings'
      )`
    );
  }

  const hasReminderStatus = await knex.schema.raw(
    `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reminder_status') as exists`
  );
  if (!hasReminderStatus.rows[0].exists) {
    await knex.schema.raw(
      `CREATE TYPE reminder_status AS ENUM ('PENDING', 'COMPLETED', 'DISMISSED')`
    );
  }

  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.specificType('type', 'notification_type').notNullable().defaultTo('info');
    table.string('title', 255).notNullable();
    table.text('message');
    table.string('entity_type', 50);
    table.uuid('entity_id');
    table.boolean('is_read').notNullable().defaultTo(false);
    table.boolean('is_archived').notNullable().defaultTo(false);
    table.uuid('user_id');
    table.timestamps(true, true);

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });

  await knex.schema.createTable('notification_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable().unique();
    table.specificType('type', 'notification_type').notNullable().defaultTo('info');
    table.string('title_template', 255).notNullable();
    table.text('message_template');
    table.specificType('variables', 'jsonb').defaultTo(knex.raw("'[]'::jsonb"));
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('reminders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.specificType('reminder_type', 'reminder_type').notNullable();
    table.uuid('vehicle_id');
    table.string('title', 255).notNullable();
    table.text('description');
    table.date('due_date').notNullable();
    table.integer('remind_before_days').notNullable().defaultTo(7);
    table.boolean('is_recurring').notNullable().defaultTo(false);
    table.integer('recurring_interval_days');
    table.timestamp('last_triggered_at');
    table.specificType('status', 'reminder_status').notNullable().defaultTo('PENDING');
    table.timestamps(true, true);
    table.timestamp('deleted_at');
    table.uuid('created_by');
    table.uuid('updated_by');

    table.foreign('vehicle_id').references('id').inTable('vehicles').onDelete('CASCADE');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('updated_by').references('id').inTable('users').onDelete('SET NULL');
  });

  await knex.schema.createTable('notification_preferences', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().unique();
    table.boolean('in_app_enabled').notNullable().defaultTo(true);
    table.boolean('email_enabled').notNullable().defaultTo(false);
    table.integer('reminder_days_before').notNullable().defaultTo(7);
    table.boolean('daily_summary').notNullable().defaultTo(false);
    table.boolean('weekly_summary').notNullable().defaultTo(false);
    table.timestamps(true, true);

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });

  await knex.schema.createTable('notification_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('notification_id');
    table.uuid('reminder_id');
    table.uuid('user_id');
    table.string('action', 50).notNullable();
    table.string('channel', 20).notNullable().defaultTo('in_app');
    table.timestamps(true, true);

    table.foreign('notification_id').references('id').inTable('notifications').onDelete('SET NULL');
    table.foreign('reminder_id').references('id').inTable('reminders').onDelete('SET NULL');
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
  });

  await knex.schema.raw(`CREATE INDEX idx_notifications_user_id ON notifications(user_id)`);
  await knex.schema.raw(`CREATE INDEX idx_notifications_is_read ON notifications(is_read)`);
  await knex.schema.raw(`CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC)`);
  await knex.schema.raw(`CREATE INDEX idx_notifications_type ON notifications(type)`);
  await knex.schema.raw(`CREATE INDEX idx_reminders_vehicle_id ON reminders(vehicle_id)`);
  await knex.schema.raw(`CREATE INDEX idx_reminders_due_date ON reminders(due_date)`);
  await knex.schema.raw(`CREATE INDEX idx_reminders_status ON reminders(status)`);
  await knex.schema.raw(`CREATE INDEX idx_reminders_type ON reminders(reminder_type)`);
  await knex.schema.raw(`CREATE INDEX idx_reminders_deleted_at ON reminders(deleted_at) WHERE deleted_at IS NOT NULL`);
  await knex.schema.raw(`CREATE INDEX idx_notification_history_user_id ON notification_history(user_id)`);
  await knex.schema.raw(`CREATE INDEX idx_notification_history_action ON notification_history(action)`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notification_history');
  await knex.schema.dropTableIfExists('notification_preferences');
  await knex.schema.dropTableIfExists('reminders');
  await knex.schema.dropTableIfExists('notification_templates');
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.raw('DROP TYPE IF EXISTS reminder_status');
  await knex.schema.raw('DROP TYPE IF EXISTS reminder_type');
  await knex.schema.raw('DROP TYPE IF EXISTS notification_type');
}
