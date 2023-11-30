import express, { NextFunction, Request, Response } from 'express';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors());

// preflight
app.options('*', cors());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

export default app;
