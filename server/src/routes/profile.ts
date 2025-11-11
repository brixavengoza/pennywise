import { Router } from 'express';
import { prisma } from '../utils/db';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from '../validations/profile';
import { comparePassword, hashPassword } from '../utils/password';

export const profileRoutes = Router();

profileRoutes.use(authenticate);

// Get current user profile
profileRoutes.get('/', async (req, res) => {
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
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
    data: user,
  });
});

// Update user profile
profileRoutes.put('/', validate(updateProfileSchema), async (req, res) => {
  const userId = req.user!.userId;
  const { name, email } = req.body;

  if (email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({
        success: false,
        error: 'Email already in use',
      });
    }
  }

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({
    success: true,
    data: user,
  });
});

// Change user password
profileRoutes.post('/change-password', validate(changePasswordSchema), async (req, res) => {
  const userId = req.user!.userId;
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  const isValidPassword = await comparePassword(currentPassword, user.passwordHash);

  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: 'Current password is incorrect',
    });
  }

  const newPasswordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  res.json({
    success: true,
    message: 'Password updated successfully',
  });
});
