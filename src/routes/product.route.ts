import express from 'express';
import productController from '../controllers/product.controller';

const productRouter = express.Router();

const labelRouter = express.Router();

export { productRouter, labelRouter };
