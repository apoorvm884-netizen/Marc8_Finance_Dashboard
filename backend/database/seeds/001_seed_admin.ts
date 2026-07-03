import type { Knex } from 'knex';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();

  const adminId = uuidv4();
  const passwordHash = await bcrypt.hash('Admin@12345', 12);

  await knex('users').insert({
    id: adminId,
    username: 'admin',
    email: 'admin@fleetdashboard.com',
    password_hash: passwordHash,
    first_name: 'System',
    last_name: 'Administrator',
    role: 'super_admin',
    is_active: true,
    is_first_login: true,
    created_at: knex.fn.now(),
    updated_at: knex.fn.now(),
  });
}
