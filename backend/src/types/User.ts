// types/User.ts
import { Document } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UserDocument extends Document, IUser {
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}
