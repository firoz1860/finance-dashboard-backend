import bcrypt from 'bcryptjs';
import prisma from '../../config/db.js';

export const listUsers = ({ skip, limit }) =>
  prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
  });

export const countUsers = () => prisma.user.count();

export const getUserById = (id) =>
  prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, updatedAt: true }
  });

export const createUser = async ({ name, email, password, role }) =>
  prisma.user.create({
    data: { name, email, password: await bcrypt.hash(password, 10), role },
    select: { id: true, name: true, email: true, role: true, status: true }
  });

export const updateUser = (id, payload) =>
  prisma.user.update({
    where: { id },
    data: payload,
    select: { id: true, name: true, email: true, role: true, status: true, updatedAt: true }
  });

export const deactivateUser = (id) =>
  prisma.user.update({
    where: { id },
    data: { status: 'INACTIVE' },
    select: { id: true, name: true, email: true, role: true, status: true }
  });

export const countActiveAdmins = () =>
  prisma.user.count({
    where: { role: 'ADMIN', status: 'ACTIVE' }
  });