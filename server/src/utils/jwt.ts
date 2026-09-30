import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UserRole } from '../models/User';

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};
