import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
}

// Generate short-lived access token
export const generateAccessToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not defined');
  }
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1m',
  });
};

// Generate long-lived refresh token
export const generateRefreshToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

// Verify access token
export const verifyAccessToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not defined');
  }
  return jwt.verify(token, secret) as JwtPayload;
};

// Verify refresh token
export const verifyRefreshToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  return jwt.verify(token, secret) as JwtPayload;
};
