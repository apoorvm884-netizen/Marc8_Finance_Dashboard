import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasEnum = await knex.schema.raw(
    `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') as exists`
  );

  if (!hasEnum.rows[0].exists) {
    await knex.schema.raw(
      `CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'operator', 'viewer')`
    );
  }

  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('username', 100).unique().notNullable();
    table.string('email', 255).unique();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100);
    table.string('last_name', 100);
    table.specificType('role', 'user_role').notNullable().defaultTo('viewer');
    table.boolean('is_active').notNullable().defaultTo(true);
    table.boolean('is_first_login').notNullable().defaultTo(true);
    table.timestamp('last_login_at');
    table.timestamps(true, true);
    table.uuid('created_by');
    table.uuid('updated_by');

    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('updated_by').references('id').inTable('users').onDelete('SET NULL');
  });

  await knex.schema.raw(
    `CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL`
  );
  await knex.schema.raw(
    `CREATE INDEX idx_users_username ON users(username)`
  );
  await knex.schema.raw(
    `CREATE INDEX idx_users_role ON users(role)`
  );
  await knex.schema.raw(
    `CREATE INDEX idx_users_is_active ON users(is_active)`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
  await knex.schema.raw('DROP TYPE IF EXISTS user_role');
}
