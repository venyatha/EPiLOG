import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { AuthUser } from '../types';

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '7d';

function signToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export async function register(username: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { username, email, passwordHash },
    select: { id: true, username: true, email: true },
  });
  const token = signToken(user);
  return { token, user };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const authUser: AuthUser = { id: user.id, username: user.username, email: user.email };
  const token = signToken(authUser);
  return { token, user: authUser };
}
