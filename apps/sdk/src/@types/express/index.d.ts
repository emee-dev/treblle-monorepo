import { TreblleSchema } from 'src/utils/utils';

export {};

declare global {
  namespace Express {
    export interface Request {
      _responseBody?: string | {} | null; // I know it's not a Record
    }
  }
}
