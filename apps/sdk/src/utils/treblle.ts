import { Application, NextFunction, Request, RequestHandler, Response, Router } from 'express';
import nodeos from 'node:os';
import PackageJson from 'package.json';
import StackTracey from 'stacktracey';
import { sendPayloadToTreblle } from './axios';
import { TreblleSchema, defaultSensitiveValues, isValidJsonString, maskBody, maskHeaders, returnQueryString } from './utils';

interface Credentials {
  apiKey: string | undefined;
  projectId: string | undefined;
}

interface StackTraceError {
  source?: string;
  type?: string;
  message?: string;
  file?: string | null;
  line?: number | null;
  [k: string]: unknown;
}

export interface Options {
  /** A testing endpoint to point the requests to for debugging purposes
   * - [Webhook Site](https://webhook.site/)
   */
  debugEndpoints: string[];
  /** Exclude routes by endpoint  */
  excludeRoutes: string[];
  /** Add your sensitive fields to mask here */
  maskValues: (string | number)[];
  /** Set to development or testing to halt monitoring */
  environment: 'production' | 'development' | 'testing';
  /** If true log error if it occurs  */
  logError: boolean;
}

interface Payload {
  req: Request;
  res: Response;
}

/**
 * Monitors the request and response for best practices and API observability.
 */
export class TreblleExpress {
  private options: Options = {
    excludeRoutes: [],
    maskValues: [...defaultSensitiveValues],
    environment: 'testing',
    debugEndpoints: [], // You can use a free online webhook service for this
    logError: false,
  };

  /** To avoid duplicate requests, only a single instance is needed. */
  private static instance: TreblleExpress;
  private stackTrace = [] as StackTraceError[];
  private treblleBaseUrls = ['https://rocknrolla.treblle.com', 'https://punisher.treblle.com', 'https://sicario.treblle.com'];

  constructor(private app: Application | Router, private credentials: Credentials) {
    if (!this.credentials.apiKey || !this.credentials.projectId) {
      throw new Error('Treblle [API_KEY] and [PROJECT_ID] are required');
    }

    // Ensure only a single instance is created
    if (TreblleExpress.instance) {
      return TreblleExpress.instance;
    }

    TreblleExpress.instance = this;
    this.app = app;
  }

  config(config: Partial<Options>): TreblleExpress {
    // Ensure a valid configuration is provided
    if (!config) {
      throw new Error('Please specify the config options for Treblle');
    }

    try {
      // Merge the provided configuration with the existing configuration
      let newConfig: Options = {
        logError: config.logError ?? this.options.logError,
        environment: config.environment ?? this.options.environment,
        debugEndpoints: [...this.options.debugEndpoints, ...(config.debugEndpoints ?? this.options.debugEndpoints)],
        maskValues: [...this.options.maskValues, ...(config.maskValues ?? this.options.maskValues)],
        excludeRoutes: [...this.options.excludeRoutes, ...(config.excludeRoutes ?? this.options.excludeRoutes)],
      };

      // Update the Treblle instance with the new configuration
      this.options = newConfig;
    } catch (error: any) {
      // Log errors during Treblle configuration if logError option is true
      if (this.options.logError) {
        console.error('[Treblle Config]', error);
      }
    }

    // Return the current Treblle instance for method chaining
    return this;
  }

  /**
   * Start listening to incoming requests.
   * Attaches a middleware to the Express app for serializing payloads in production or testing environment.
   * @returns {TreblleExpress} - The current instance for method chaining.
   */
  listen(): TreblleExpress {
    this.app.use(async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Only serialize payloads in production or testing environment
        if (this.options.environment === 'production' || this.options.environment === 'testing') {
          this.serializePayload({ req, res });
        }

        // Continue with the next middleware in the stack
        next();
      } catch (error: any) {
        // Log any errors during Treblle listening, if logError option is true
        if (this.options.logError) {
          console.log('[Treblle Listening]');
          console.error(error);
        }
      }
    });

    // Return the current instance for method chaining
    return this;
  }

  /**
   * A custom async error handler middleware.
   * @param {Function} fn - The asynchronous function or middleware to be wrapped by the error handler.
   * @returns {RequestHandler} - A middleware function that catches and logs errors, then passes them to the next middleware.
   */
  errorHandler(fn: (req: Request, res: Response, next: NextFunction) => void | Promise<any>): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      // Execute the provided function and handle any errors
      Promise.resolve(fn(req, res, next)).catch((err: any) => {
        // Extract relevant information from the error
        let { file, fileName, line } = new StackTracey(err).items[0];

        // Create a structured error object for logging and reporting
        this.stackTrace.push({
          source: fileName,
          type: err.type ?? 'UNHANDLED_EXCEPTION',
          message: err.message,
          file: file ?? null,
          line: line ?? null,
        });

        // Log the error if logError option is true
        if (this.options.logError) {
          console.error({
            source: fileName,
            type: err.type ?? 'UNHANDLED_EXCEPTION',
            message: err.message,
            file: file ?? null,
            line: line ?? null,
          });
        }

        // Pass the error to the next middleware
        next(err);
      });
    };
  }

  /**
   * Asynchronously serializes the payload for Treblle logging.
   *
   * @param {Object} payload - The payload object containing request and response details.
   * @param {Object} payload.req - The request object.
   * @param {Object} payload.res - The response object.
   */
  private serializePayload = async ({ req, res }: Payload) => {
    // Capture the start time for performance measurement
    const startTime = process.hrtime();

    // Store the original end method of the response for later use
    const originalEnd = res.end;

    // Array to hold response body chunks
    const chunks: Buffer[] = [];

    let API_KEY: string;
    let PROJECT_ID: string;

    // Mask API_KEY and PROJECT_ID based on the environment
    if (this.options.environment === 'production') {
      API_KEY = this.credentials.apiKey!;
      PROJECT_ID = this.credentials.projectId!;
    } else {
      API_KEY = `${'*'.repeat(this.credentials.apiKey?.length ?? 8)}`;
      PROJECT_ID = `${'*'.repeat(this.credentials.projectId?.length ?? 8)}`;
    }

    // Alias for the request object
    let request = req;

    // Override the end method to capture the response body
    // @ts-expect-error
    res.end = (chunk: any, encoding: any, callback: any): any => {
      try {
        if (chunk) {
          if (Buffer.isBuffer(chunk)) {
            chunks.push(chunk);
          } else if (typeof chunk === 'string') {
            const buffer = Buffer.from(chunk, encoding || 'utf-8');
            chunks.push(buffer);
          }
        }

        // Call the original end method
        originalEnd.call(res, chunk, encoding);

        // Concatenate chunks into a custom data buffer
        const customDataBuffer = Buffer.concat(chunks);
        const inputString = customDataBuffer.toString('utf-8');

        // Parse inputString if it's a valid JSON string, otherwise treat it as a string of words
        if (isValidJsonString(inputString)) {
          request._responseBody = JSON.parse(inputString);
        } else {
          request._responseBody = inputString;
        }
      } catch (error: any) {
        if (this.options.logError) {
          console.log('[Response End]');
          console.error(error.message);
        }
      }
    };

    // Event listener for the 'close' event of the response
    res.on('close', async () => {
      try {
        // Retrieve the response body from the request object
        let responseBody = request._responseBody;

        // Measure the elapsed time since the start
        const endTime = process.hrtime(startTime);
        const elapsedTime = endTime[0] * 1e9 + endTime[1] / 1e3;

        const microseconds = Math.ceil(elapsedTime);

        // Create the payload object for Treblle logging
        let payload: TreblleSchema = {
          api_key: API_KEY,
          project_id: PROJECT_ID,
          sdk: 'express',
          version: PackageJson.version,
          data: {
            errors: [...this.stackTrace],
            language: { name: 'node', version: process.version },
            request: {
              body: maskBody(req.body, this.options.maskValues),
              headers: {
                ...maskHeaders(
                  {
                    ...req.headers,
                    'user-agent': req.headers['user-agent']!,
                    'content-length': req.headers['content-length']!,
                    'content-type': req.headers['content-type']!,
                    host: req.headers['host']!,
                  },
                  this.options.maskValues,
                ),
              },
              ip: req.headers['x-forwarded-for']?.toString() || req.ip,
              method: req.method,
              timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19), // The timestamp of request
              url: returnQueryString(req, this.options.maskValues), // The route endpoint
              user_agent: req.headers['user-agent']!,
            },
            response: {
              body: maskBody(responseBody, this.options.maskValues),
              code: res.statusCode,
              headers: res.getHeaders(),
              load_time: microseconds, // the time taken to give client a response
              size: `${Buffer.byteLength(JSON.stringify(responseBody), 'utf-8')}`, // response size in bytes
            },
            server: {
              // ip: os.ip(), // absent in original sdk
              os: {
                name: nodeos.platform(),
                release: nodeos.release(),
                architecture: nodeos.arch(),
              },
              protocol: `${req.protocol.toUpperCase()}/${req.httpVersion}`,
              signature: `${'x-powered-by'}: ${JSON.parse(JSON.stringify({ ...res.getHeaders() }))['x-powered-by']}`,
              software: null, // Don't understand what this is for
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              // encoding: res.getHeader('content-encoding')?.toString() || 'utf-8', // absent in original sdk
            },
          },
        };

        // Send the payload to Treblle for logging
        await sendPayloadToTreblle({
          API_KEY: API_KEY,
          options: this.options,
          trebllePayload: payload,
          treblleBaseUrls: this.treblleBaseUrls,
        });

        // Reset StackTrace
        this.stackTrace = [];
      } catch (error: any) {
        // Handle errors during the 'close' event and log if necessary
        if (this.options.logError) {
          console.log('[Response OnClose]');
          console.error(error.message);
        }
      }
    });
  };
}
