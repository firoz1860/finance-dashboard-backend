import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db.js';

const tokenFor = (user) =>
  jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    subject: user.id,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

const createUserAccount = async ({ name, email, password, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email already exists');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await prisma.user.create({
    data: { name, email, password: passwordHash, role }
  });

  return { id: created.id, name: created.name, email: created.email, role: created.role };
};

export const registerUser = async ({ name, email, password, role = 'VIEWER' }) => {
  return createUserAccount({ name, email, password, role });
};

export const registerFirstUser = async ({ name, email, password }) => {
  const activeUsersCount = await prisma.user.count({ where: { status: 'ACTIVE' } });
  // if (activeUsersCount > 0) {
  //   const error = new Error('Open registration is disabled while active users exist');
  //   error.statusCode = 403;
  //   throw error;
  // }

  if (activeUsersCount > 0 && process.env.ALLOW_OPEN_REGISTER !== 'true') {
  const error = new Error('Open registration is disabled while active users exist');
  error.statusCode = 403;
  throw error;
}

  return createUserAccount({ name, email, password, role: 'ADMIN' });
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const error = new Error('User does not exist');
    error.statusCode = 404;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    const error = new Error('Incorrect password');
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== 'ACTIVE') {
    const error = new Error('User account is inactive');
    error.statusCode = 403;
    throw error;
  }

  return {
    token: tokenFor(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  };
};