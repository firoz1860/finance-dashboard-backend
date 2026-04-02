import { z } from 'zod';
import { successResponse } from '../../utils/apiResponse.js';
import { loginUser, registerFirstUser, registerUser } from './auth.service.js';

const passwordRule = z
  .string()
  .min(8)
  .regex(/\d/, 'Password must include at least one number');

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: passwordRule,
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional()
});

const firstRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: passwordRule
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const register = async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const user = await registerUser(payload);
    return successResponse(res, {
      statusCode: 201,
      data: user,
      message: 'User registered successfully'
    });
  } catch (error) {
    return next(error);
  }
};

export const registerOpen = async (req, res, next) => {
  try {
    const payload = firstRegisterSchema.parse(req.body);
    const user = await registerFirstUser(payload);
    return successResponse(res, {
      statusCode: 201,
      data: user,
      message: 'First admin account created successfully'
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const session = await loginUser(payload);
    return successResponse(res, { data: session, message: 'Login successful' });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res) =>
  successResponse(res, { data: null, message: 'Logged out. Clear token on client.' });

export const me = async (req, res) =>
  successResponse(res, { data: req.user, message: 'Current user profile' });