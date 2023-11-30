import { TreblleExpress } from '../src/index';
import { TreblleSchema } from '../src/utils/utils';

import test_server from 'sample/src/test_server';
// import { Listen, Request, Response } from 'sample/src/type';
export { Request, Response, NextFunction, Application, Express } from 'express';

export type Listen = Server<typeof IncomingMessage, typeof ServerResponse>;
import { agent } from 'supertest';

const wait = (time: number) => {
  return new Promise((resolve) => {
    return setTimeout(resolve, time);
  });
};

describe('Treblle Express Middleware', () => {
  let debugServer: Listen | null;
  let PORT = 7500;

  beforeEach((done) => {
    debugServer = test_server.listen(PORT, () => {
      done();
    });

    const Treblle = new TreblleExpress(test_server, { apiKey: 'process.env.TREBLLE_API_KEY', projectId: 'process.env.TREBLLE_PROJECT_ID' })
      .config({
        environment: 'testing',
        // debugEndpoints: ['https://webhook.site/f9f7893c-7856-4a89-8b59-cb9654599b0b'],
        debugEndpoints: [`http://localhost:${PORT}/sdk-data`],
        maskValues: ['email', 'name'],
        logError: false,
      })
      .listen();

    test_server.get('/', (req: Request, res: Response) => {
      res.send({ message: 'Test server is well and working' });
    });

    test_server.post('/body', (req: Request, res: Response) => {
      try {
        res.status(200).send({ status: 'success', data: 'This is server response body' });
      } catch (error) {
        res.status(500).send(error);
      }
    });

    /** We retrieve the sdk data from the express locals */
    test_server.get('/sdk-data', (req: Request, res: Response) => {
      try {
        let sdkdata = test_server.locals.sdkdata;

        let capturedRequestData = sdkdata.data.request;
        let capturedResponseData = sdkdata.data.response;
        let capturedServerData = sdkdata.data.server;
        let capturedServerError = sdkdata.data.errors;
        let capturedCredentials = {
          api_key: sdkdata.api_key,
          project_id: sdkdata.project_id,
        };

        // Clear the data just in case
        test_server.locals.sdkdata = null;

        res.status(200).send({ capturedCredentials, capturedServerError, capturedRequestData, capturedResponseData, capturedServerData });
      } catch (error) {
        res.status(500).send(error);
      }
    });

    /** Here we dump the sdk data */
    test_server.post('/sdk-data', (req: Request, res: Response) => {
      try {
        // Save the intial request data, else subsequent sdk
        // response logs will override the intial test request data
        if (!test_server.locals.sdkdata) {
          test_server.locals.sdkdata = req.body;
        }

        res.status(200).send({ status: 'success' });
      } catch (error) {
        res.status(500).send(error);
      }
    });

    test_server.get(
      '/error',
      Treblle.errorHandler(async (req: Request, res: Response) => {
        throw new Error('Payment was denied, please try again later');
      }),
    );
  });

  afterEach((done) => {
    if (debugServer) {
      debugServer.closeAllConnections();
      debugServer.closeIdleConnections();
      debugServer.close();
      setTimeout(done, 2000);
    }
  });

  it('should capture request and response data', async () => {
    let requestData = { username: 'emee', password: '123' };
    await agent(debugServer).post('/body').send(requestData);

    await wait(1000);

    const { body } = await agent(debugServer).get('/sdk-data');

    let capturedRequestBody = body.capturedRequestData.body;
    let capturedResponseData = body.capturedResponseData.body;
    let capturedSDKAuth = body.capturedCredentials;

    expect(capturedRequestBody).toEqual({ username: 'emee', password: '***' });
    expect(capturedSDKAuth).toEqual({ api_key: '***************************', project_id: '******************************' });
    expect(capturedResponseData).toEqual({ status: 'success', data: 'This is server response body' });
  });

  it('should capture any server error', async () => {
    await agent(debugServer).get('/error');

    await wait(1000);

    const { body } = await agent(debugServer).get('/sdk-data');

    let capturedError: TreblleSchema['data']['errors'] = body.capturedServerError;

    expect(capturedError.length).toBeGreaterThan(0);
    expect(capturedError[0].source).toBeTruthy();
    expect(capturedError[0].type).toBeTruthy();
    expect(capturedError[0].message).toMatch('Payment was denied, please try again later');
    expect(capturedError[0].file).toBeTruthy();
    expect(capturedError[0].line).toBeTruthy();
  });
});
