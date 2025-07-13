import 'express-session';

declare module 'express-session' {
  interface Session {
    userId?: string; // Add the userId property
  }
}