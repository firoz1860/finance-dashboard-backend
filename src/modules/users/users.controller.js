import { successResponse } from '../../utils/apiResponse.js';
import { resolvePagination } from '../../utils/pagination.js';
import { createUserSchema, updateUserSchema } from './users.validation.js';
import { countActiveAdmins, countUsers, createUser, deactivateUser, getUserById, listUsers, updateUser } from './users.service.js';

const ensureSafeAdminChange = async (targetUser, nextPayload, actorUserId) => {
  const nextRole = nextPayload.role ?? targetUser.role;
  const nextStatus = nextPayload.status ?? targetUser.status;

  const isDemotingActiveAdmin =
    targetUser.role === 'ADMIN' &&
    targetUser.status === 'ACTIVE' &&
    (nextRole !== 'ADMIN' || nextStatus !== 'ACTIVE');

  if (!isDemotingActiveAdmin) return;

  const activeAdmins = await countActiveAdmins();
  if (activeAdmins <= 1) {
    const error = new Error('At least one active admin account is required');
    error.statusCode = 400;
    throw error;
  }

  if (targetUser.id === actorUserId && nextStatus !== 'ACTIVE') {
    const error = new Error('You cannot deactivate your own account');
    error.statusCode = 400;
    throw error;
  }
};

export const list = async (req, res, next) => {
  try {
    const { page, limit, skip } = resolvePagination(req.query.page, req.query.limit);
    const [users, total] = await Promise.all([listUsers({ skip, limit }), countUsers()]);
    return successResponse(res, { data: users, meta: { page, total } });
  } catch (error) {
    return next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return successResponse(res, { data: user });
  } catch (error) {
    return next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const user = await createUser(createUserSchema.parse(req.body));
    return successResponse(res, { statusCode: 201, data: user, message: 'User created successfully' });
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const payload = updateUserSchema.parse(req.body);
    const targetUser = await getUserById(req.params.id);
    if (!targetUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    await ensureSafeAdminChange(targetUser, payload, req.user.id);
    const updated = await updateUser(req.params.id, payload);
    return successResponse(res, { data: updated, message: 'User updated successfully' });
  } catch (error) {
    return next(error);
  }
};

export const deactivate = async (req, res, next) => {
  try {
    const targetUser = await getUserById(req.params.id);
    if (!targetUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    await ensureSafeAdminChange(targetUser, { status: 'INACTIVE' }, req.user.id);
    const deactivated = await deactivateUser(req.params.id);
    return successResponse(res, { data: deactivated, message: 'User deactivated successfully' });
  } catch (error) {
    return next(error);
  }
};