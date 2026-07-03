import { getDatabase } from '../config/database';
import { comparePassword, hashPassword, generateToken, sanitizeUser } from '../utils/helpers';
import { UnauthorizedError, NotFoundError, ConflictError } from '../utils/errors';
import { LoginDTO, ChangePasswordDTO, AuthPayload, User, UserRole } from '../types';

export class AuthService {
  async login(data: LoginDTO) {
    const db = getDatabase();

    const user = await db<User>('users')
      .where({ username: data.username })
      .first();

    if (!user) {
      throw new UnauthorizedError('Invalid username or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated. Contact an administrator.');
    }

    const isValidPassword = await comparePassword(data.password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid username or password');
    }

    const tokenPayload: AuthPayload = {
      userId: user.id,
      username: user.username,
      role: user.role as UserRole,
      restrictions: user.restrictions || null,
    };

    const token = generateToken(tokenPayload);

    await db('users')
      .where({ id: user.id })
      .update({
        last_login_at: db.fn.now(),
        updated_at: db.fn.now(),
      });

    return {
      user: sanitizeUser(user),
      token,
    };
  }

  async changePassword(userId: string, data: ChangePasswordDTO) {
    const db = getDatabase();

    const user = await db<User>('users')
      .where({ id: userId })
      .first();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isValidPassword = await comparePassword(data.currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    if (data.currentPassword === data.newPassword) {
      throw new ConflictError('New password must be different from current password');
    }

    const newPasswordHash = await hashPassword(data.newPassword);

    await db('users')
      .where({ id: userId })
      .update({
        password_hash: newPasswordHash,
        is_first_login: false,
        updated_at: db.fn.now(),
      });

    return { message: 'Password changed successfully' };
  }

  async getProfile(userId: string) {
    const db = getDatabase();

    const user = await db<User>('users')
      .where({ id: userId })
      .first();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return sanitizeUser(user);
  }

  async updateProfile(userId: string, data: Partial<Pick<User, 'first_name' | 'last_name' | 'email'>>) {
    const db = getDatabase();

    const user = await db<User>('users')
      .where({ id: userId })
      .first();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existingEmail = await db<User>('users')
        .where({ email: data.email })
        .whereNot({ id: userId })
        .first();

      if (existingEmail) {
        throw new ConflictError('Email is already in use');
      }
    }

    const updateData: Record<string, unknown> = {
      updated_at: db.fn.now(),
    };

    if (data.first_name !== undefined) updateData.first_name = data.first_name;
    if (data.last_name !== undefined) updateData.last_name = data.last_name;
    if (data.email !== undefined) updateData.email = data.email;

    await db('users')
      .where({ id: userId })
      .update(updateData);

    const updatedUser = await db<User>('users')
      .where({ id: userId })
      .first();

    return sanitizeUser(updatedUser!);
  }
}

export const authService = new AuthService();
