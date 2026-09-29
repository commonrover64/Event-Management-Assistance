declare global {
  namespace Express {
    interface Request {
      // Set by requireAuth on protected routes
      auth?: { userId: string };
    }
  }
}

export {};
