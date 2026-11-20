declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: string;
        email: string;
        role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
      };
    }
  }
}

export {};
