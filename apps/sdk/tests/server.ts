import express from 'express';

import cors from 'cors';

const app = express();

app.use(cors());

// preflight
app.options('*', cors());

app.use(express.json());

export default app;
