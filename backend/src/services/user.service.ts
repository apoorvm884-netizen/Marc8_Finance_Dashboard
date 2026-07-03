import { getDatabase } from '../config/database';
import { hashPassword, sanitizeUser, parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError, ConflictError } from '../utils/errors';
import { User, CreateUserDTO, UpdateUserDTO, PaginationMeta, UserRole } from '../types';

export class UserService {
  async create(data: CreateUserDTO, createdBy?: string) {
    const db = getDatabase();

    const existingUsername = await db<User>('users')
      .where({ username: data.username })
      .first();

    if (existingUsername) {
      throw new ConflictError('Username is already taken');
    }

    if (data.email) {
      const existingEmail = await db<User>('users')
        .where({ email: data.email })
        .first();

      if (existingEmail) {
        throw new ConflictError('Email is already in use');
      }
    }

    const passwordHash = await hashPassword(data.password);

    const [user] = await db<User>('users')
      .insert({
        username: data.username,
        email: data.email || null,
        password_hash: passwordHash,
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        role: data.role,
        is_active: true,
        is_first_login: true,
        created_by: createdBy || null,
        updated_by: createdBy || null,
      })
      .returning('*');

    return sanitizeUser(user);
  }

  async findAll(query: {
    page?: string;
    limit?: string;
    sort_by?: string;
    sort_order?: string;
    role?: string;
    is_active?: string;
    search?: string;
  }) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query);
    const filters = parseFilters(query);

    let queryBuilder = db<User>('users');

    if (filters.role) {
      queryBuilder = queryBuilder.where('role', filters.role);
    }

    if (filters.is_active !== undefined) {
      queryBuilder = queryBuilder.where('is_active', filters.is_active === 'true');
    }

    if (filters.search) {
      queryBuilder = queryBuilder.where(function () {
        this.where('username', 'ilike', `%${filters.search}%`)
          .orWhere('email', 'ilike', `%${filters.search}%`)
          .orWhere('first_name', 'ilike', `%${filters.search}%`)
          .orWhere('last_name', 'ilike', `%${filters.search}%`);
      });
    }

    const countQuery = queryBuilder.clone();
    const countResult = await countQuery.count('* as count').first() as { count: string | number } | undefined;
    const total = Number(countResult?.count ?? 0);

    const users = await queryBuilder
      .orderBy(sort.column, sort.order)
      .limit(pagination.limit)
      .offset(pagination.offset);

    const meta: PaginationMeta = {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
      hasNextPage: pagination.page * pagination.limit < total,
      hasPreviousPage: pagination.page > 1,
    };

    return {
      data: users.map((user) => sanitizeUser(user)),
      meta,
    };
  }

  async findById(id: string) {
    const db = getDatabase();

    const user = await db<User>('users')
      .where({ id })
      .first();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return sanitizeUser(user);
  }

  async update(id: string, data: UpdateUserDTO, updatedBy?: string) {
    const db = getDatabase();

    const user = await db<User>('users')
      .where({ id })
      .first();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (data.username && data.username !== user.username) {
      const existingUsername = await db<User>('users')
        .where({ username: data.username })
        .whereNot({ id })
        .first();

      if (existingUsername) {
        throw new ConflictError('Username is already taken');
      }
    }

    if (data.email && data.email !== user.email) {
      const existingEmail = await db<User>('users')
        .where({ email: data.email })
        .whereNot({ id })
        .first();

      if (existingEmail) {
        throw new ConflictError('Email is already in use');
      }
    }

    const updateData: Record<string, unknown> = {
      updated_at: db.fn.now(),
      updated_by: updatedBy || null,
    };

    const fields: (keyof UpdateUserDTO)[] = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active'];
    for (const field of fields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (data.restrictions !== undefined) {
      updateData.restrictions = data.restrictions ? JSON.stringify(data.restrictions) : null;
    }

    await db('users')
      .where({ id })
      .update(updateData);

    const updatedUser = await db<User>('users')
      .where({ id })
      .first();

    return sanitizeUser(updatedUser!);
  }

  async delete(id: string) {
    const db = getDatabase();

    const user = await db<User>('users')
      .where({ id })
      .first();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ConflictError('Cannot delete a super admin user');
    }

    await db('users')
      .where({ id })
      .del();

    return { message: 'User deleted successfully' };
  }

  async activate(id: string, updatedBy?: string) {
    const db = getDatabase();

    const user = await db<User>('users')
      .where({ id })
      .first();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.is_active) {
      return sanitizeUser(user);
    }

    await db('users')
      .where({ id })
      .update({
        is_active: true,
        updated_at: db.fn.now(),
        updated_by: updatedBy || null,
      });

    const updatedUser = await db<User>('users')
      .where({ id })
      .first();

    return sanitizeUser(updatedUser!);
  }

  async deactivate(id: string, updatedBy?: string) {
    const db = getDatabase();

    const user = await db<User>('users')
      .where({ id })
      .first();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ConflictError('Cannot deactivate a super admin user');
    }

    if (!user.is_active) {
      return sanitizeUser(user);
    }

    await db('users')
      .where({ id })
      .update({
        is_active: false,
        updated_at: db.fn.now(),
        updated_by: updatedBy || null,
      });

    const updatedUser = await db<User>('users')
      .where({ id })
      .first();

    return sanitizeUser(updatedUser!);
  }
}

export const userService = new UserService();
