import bcrypt from 'bcryptjs';

// Hash password before storing
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

// Compare plain text password with stored hash
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
