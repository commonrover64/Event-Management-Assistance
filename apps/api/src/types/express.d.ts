declare global {
  namespace Express {
    interface Request {
      // Set by requireAuth on protected routes
      auth?: { userId: string };
      // Set by requireEventAccess once ownership is verified
      eventId?: string;
    }
  }
}

export {};
