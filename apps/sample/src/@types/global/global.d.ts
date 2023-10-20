declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;

      TREBLLE_API_KEY: string;
      TREBLLE_PROJECT_ID: string;
    }
  }
}

export {};
