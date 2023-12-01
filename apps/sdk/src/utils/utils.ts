import { Request } from 'express';

// Default list of sensitive fields to mask
export const defaultSensitiveValues = [
  'password',
  'pwd',
  'secret',
  'password_confirmation',
  'passwordConfirmation',
  'cc',
  'card_number',
  'cardNumber',
  'ccv',
  'ssn',
  'credit_score',
  'creditScore',
];

export interface TreblleSchema {
  api_key: string;
  project_id: string;
  version: number | string;
  sdk: string;
  data: {
    server: {
      // ip: string; // absent in original sdk
      timezone: string;
      os: {
        name: string;
        release: string;
        architecture: string;
        [k: string]: unknown;
      };
      software: string | null;
      signature: string | null;
      protocol: string;
      // encoding?: string; // absent in original sdk
      [k: string]: unknown;
    };
    language: {
      name: string;
      version: string;
      expose_php?: string;
      display_errors?: string;
      [k: string]: unknown;
    };
    request: {
      timestamp: string;
      ip: string | undefined;
      url: string;
      user_agent: string;
      method: string;
      headers: {
        'content-type'?: string;
        'content-length'?: string | number;
        'user-agent': string;
        host: string;
        [k: string]: unknown;
      };
      body: {
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    response: {
      headers: {
        [k: string]: unknown;
      };
      code: number;
      size: number | string;
      load_time: number;
      body:
        | string
        | {
            [k: string]: unknown;
          }
        | null;
      [k: string]: unknown;
    };
    errors:
      | []
      | {
          source?: string;
          type?: string;
          message?: string;
          file?: string | null; // schema says string
          line?: number | null; // schema says number
          [k: string]: unknown;
        }[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

/**
 * Masks sensitive fields in a JSON payload or string, based on a provided blacklist.
 *
 * @param {any} payload - The JSON payload or string to be processed and masked.
 * @param {(string | number)[]} [blackList=[]] - An optional array of field names or keys to be excluded from masking.
 * @returns {any} - The processed payload with sensitive fields masked or the original payload if it's not valid JSON.
 */
export function maskBody(payload: any, blackList: (string | number)[] = []): any {
  const defaultMask = '*';

  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const maskObject = (obj: any) => {
    const masked: any = {};

    for (const property in obj) {
      if (blackList.includes(property)) {
        if (Array.isArray(obj[property])) {
          masked[property] = obj[property].map((item: any) => {
            return item ? defaultMask.repeat(String(item).length) : defaultMask.repeat(6);
          });
        } else {
          if (property.toLowerCase() === 'authorization') {
            const [bearer, value] = (obj[property] || '').split(' ');
            masked[property] = `${bearer || ''} ${defaultMask.repeat(value?.length ?? 6)}`;
          } else {
            masked[property] = obj[property] ? defaultMask.repeat(String(obj[property]).length) : defaultMask.repeat(6);
          }
        }
      } else if (Array.isArray(obj[property])) {
        masked[property] = obj[property].map((item: any) => maskObject(item));
      } else if (typeof obj[property] === 'object' && obj[property] !== null) {
        masked[property] = maskObject({ ...obj[property] });
      } else {
        masked[property] = obj[property];
      }
    }

    return masked;
  };

  return maskObject(payload);
}

/**
 * RoundRobinBalancer class for distributing requests in a round-robin fashion among a list of URLs.
 */
export class RoundRobinBalancer {
  private urls: string[]; // Array of URLs to be balanced.
  private currentIndex: number; // Index to keep track of the current URL.

  /**
   * Constructs a RoundRobinBalancer instance with the given list of URLs.
   * @param {string[]} urls - An array of URLs to be balanced.
   */
  constructor(urls: string[]) {
    this.urls = urls;
    this.currentIndex = 0;
  }

  /**
   * Gets the next Treblle base URL in a round-robin fashion.
   * @returns {Promise<string>} - A promise resolving to the next Treblle base URL.
   */
  getTreblleBaseUrl(): Promise<string> {
    return new Promise<string>((resolve) => {
      const currentUrl = this.urls[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.urls.length;
      resolve(currentUrl);
    });
  }
}

/**
 * Masks specified query string parameters in a given URL for security and privacy.
 *
 * @param {string} inputString - The input URL query string to be modified.
 * @param {string[]} [blackList=[]] - An array of keys whose values should be masked with '*'. Defaults to an empty array.
 * @returns {string} - The modified URL query string with masked values.
 * @throws {Error} Throws an error if blackList is not an array.
 *
 * @example
 * const blackListValues = ['name', 'age'];
 * const test = '/query?name=jonah&age=23&age=25';
 * const modifiedString = maskQueryString(test, blackListValues);
 * console.log(modifiedString);
 */
export function maskQueryString(inputString: string, blackList: (string | number)[] = []): string {
  // Check if inputString is a string
  if (typeof inputString !== 'string') {
    return inputString;
  }

  // Check if blackList is an array
  if (!Array.isArray(blackList) || blackList.length === 0) {
    return '';
  }

  const regex = new RegExp(`(${blackList.join('|')})=([^&]+)`, 'g');

  const modifiedString = inputString.replace(regex, (match, p1, p2) => {
    // p1 is the key, p2 is the value
    return `${p1}=${'*'.repeat(p2.length ?? 6)}`;
  });

  return modifiedString;
}

export function returnQueryString(request: Request, blackList: (string | number)[] = []) {
  return `${request.protocol}://${request.get('host')}${maskQueryString(request.originalUrl, blackList)}`;
}

// Function to pick specific fields from headers
export function maskHeaders(headers: Record<string, unknown>, blackList: (string | number)[] = []) {
  return { ...maskBody(headers, blackList) };
}

export const isValidJsonString = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};
