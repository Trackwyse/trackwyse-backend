import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { productRouter, labelRouter } from './routes/product.route';
import { morganLogger } from './utils/logger';
import authRouter from './routes/auth.route';

const app = express();

// Test
app.use(cors());
app.use(helmet());
app.use(morganLogger);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use('/auth/v1', authRouter);
app.use('/api/v1', productRouter);
app.use('/api/v1/labels', labelRouter);

export default app;
