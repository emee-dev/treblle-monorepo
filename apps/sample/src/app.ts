import express, { NextFunction, Request, Response } from 'express';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { TreblleExpress } from '@trythis/treblle-express';

const app = express();

import router from './router/index.ts';

app.use(cors());

// preflight
app.options('*', cors());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

const Treblle = new TreblleExpress(app, { apiKey: process.env.TREBLLE_API_KEY, projectId: process.env.TREBLLE_PROJECT_ID })
  .config({
    environment: 'production',
    // environment: 'development',
    // debugEndpoints: ['https://webhook.site/55df1ba9-1856-4cf1-9f7b-d160b297a8ee'],
    // debugEndpoints: ['https://debug.treblle.com'],
    maskValues: ['email', 'name'],
    logError: true,
  })
  .listen();

app.get('/', (req: Request, res: Response) => {
  res.send({ message: 'App is doing just fine' });
});

// app.get(
//   '/',
//   Trebble.errorHandler(async (req: Request, res: Response) => {
//     // try {
//     // const wait = (time: number) =>
//     //   new Promise((resolve) => {
//     //     return setTimeout(resolve, time);
//     //   });

//     // await wait(3000);

//     res.send({ status: 'This is the base endpoint', password: 'sammy' });
//     // } catch (error) {
//     //   res.status(500).send(error);
//     // }
//   }),
// );

app.get('/query', (req: Request, res: Response) => {
  try {
    res.send({ status: 'success' });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/params/:id', (req: Request, res: Response) => {
  try {
    res.send({ status: 'success' });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/body', (req: Request, res: Response) => {
  // let body = req.body;
  try {
    res.send({ status: 'success' });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.use('/router', router);

app.get(
  '/error',
  Treblle.errorHandler(async (req: Request, res: Response) => {
    // try {
    throw new Error('This route is buggy');
    // } catch (error) {
    //   res.status(500).send(error);
    // }
  }),
);

app.get(
  '/error',
  Treblle.errorHandler(async (req: Request, res: Response) => {
    // try {
    throw new Error('This route is buggy');
    // } catch (error) {
    //   res.status(500).send(error);
    // }
  }),
);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  let message = error.message;

  res.status(500).send({ status: 'error', message });
});

export default app;
