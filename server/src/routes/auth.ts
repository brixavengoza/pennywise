import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../utils/db';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validations/auth';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

export const authRoutes = Router();

const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15mins
  max: 5,
  message: {
    success: false,
    error: 'Too many refresh token requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register new user
authRoutes.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password, name } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'User with this email already exists',
    });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  res.status(201).json({
    success: true,
    user,
    tokens: {
      accessToken,
      refreshToken,
    },
  });
});

// Login user
authRoutes.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password',
    });
  }

  const isValidPassword = await comparePassword(password, user.passwordHash);

  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password',
    });
  }

  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  });
});

// Refresh access token
authRoutes.post('/refresh', refreshRateLimiter, validate(refreshTokenSchema), async (req, res) => {
  const { refreshToken: token } = req.body;

  try {
    const payload = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    res.json({
      success: true,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token',
    });
  }
});

// Get current user
authRoutes.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  res.json({
    success: true,
    user,
  });
});
